import { jsPDF } from 'jspdf';
import { formatCurrency, getCategoryById } from './categories';

type CategoryRecord = {category:string;amount:number;percentage:number};
type PrintableReport = {
 totalIncome?:number; totalExpense?:number; netBalance?:number; savingsRate?:number;
 categoryBreakdown?:CategoryRecord[];
 financialHealth?:{status?:string;recommendation?:string};
};
/** Render Vietnamese text with browser fonts to PNG pages; jsPDF built-in fonts lack Vietnamese glyphs. */
export function downloadVietnameseReport(report:PrintableReport, period:string, currency:string){
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
 const W=1240,H=1754,margin=90,maxWidth=W-2*margin;
 const pages:HTMLCanvasElement[]=[];
 let canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,y:number;
 function newPage(){
  canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const value=canvas.getContext('2d');if(!value)throw new Error('Không thể tạo nội dung PDF');ctx=value;
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';y=85;
  pages.push(canvas);
 }
 function ensure(height:number){if(y+height>H-105)newPage();}
 function text(value:string,size=30,bold=false,color='#17253c',space=12){
  ctx.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;
  const words=String(value).split(/\s+/);let line='';const lines:string[]=[];
  for(const word of words){const next=line?line+' '+word:word;
    if(ctx.measureText(next).width>maxWidth && line){lines.push(line);line=word;} else line=next;}
  if(line)lines.push(line);if(!lines.length)lines.push('');
  ensure(lines.length*(size+10)+space);
  ctx.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;
  ctx.fillStyle=color;
  for(const l of lines){ctx.fillText(l,margin,y);y+=size+10;}
  y+=space;
 }
 newPage();
 text('FINTRACK VN – BÁO CÁO TÀI CHÍNH',42,true,'#087e62',32);
 const names:Record<string,string>={month:'Theo tháng',quarter:'Theo quý',year:'Theo năm'};
 text('Kỳ báo cáo: '+(names[period]||period),25);
 text('Ngày xuất: '+new Date().toLocaleDateString('vi-VN'),25, false,'#475569',45);
 text('1. TỔNG QUAN THU CHI',33,true,'#0f172a',22);
 text('Tổng thu nhập: '+formatCurrency(report.totalIncome||0,currency));
 text('Tổng chi tiêu: '+formatCurrency(report.totalExpense||0,currency));
 text('Chênh lệch thu chi: '+formatCurrency(report.netBalance||0,currency));
 text('Tỷ lệ tích lũy: '+(report.savingsRate||0)+'%',29,false,'#334155',40);
 text('2. CHI TIÊU THEO DANH MỤC',33,true,'#0f172a',22);
 if(report.categoryBreakdown?.length){for(const r of report.categoryBreakdown){
  const c=getCategoryById(r.category);
  text('• '+c.labelVi+': '+formatCurrency(r.amount,currency)+' ('+r.percentage+'%)',27);
 }}else text('Chưa có dữ liệu chi tiêu trong kỳ.',27);
 y+=26;
 text('3. NHẬN XÉT TÀI CHÍNH',33,true,'#0f172a',20);
 text('Trạng thái: '+(report.financialHealth?.status||'Chưa có đánh giá'),27);
 text(report.financialHealth?.recommendation||'Hãy theo dõi các khoản thu và chi để quản lý tài chính hiệu quả.',26);
 pages.forEach((p,i)=>{if(i)pdf.addPage();pdf.addImage(p.toDataURL('image/png'),'PNG',0,0,210,297);});
 const iso=new Date().toLocaleDateString('en-CA');pdf.save(`FinTrack_BaoCao_${period}_${iso}.pdf`);
}
