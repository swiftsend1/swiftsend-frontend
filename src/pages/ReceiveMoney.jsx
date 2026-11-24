import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft,ArrowRight,Banknote,CheckCircle2,Info,Smartphone,WalletCards } from 'lucide-react';
import { addDemoBalance, formatWalletAmount, setVerified } from '../lib/wallet';
const options=[
 {id:'mobile',icon:Smartphone,title:'Mobile money',detail:'Payout to a supported mobile wallet',availability:'Provider activation required'},
 {id:'bank',icon:Banknote,title:'Bank account',detail:'Payout to a supported bank account',availability:'Provider activation required'},
 {id:'wallet',icon:WalletCards,title:'SwiftSend wallet',detail:'Receive into a SwiftSend wallet balance',availability:'Wallet funding not enabled'}
];
export default function ReceiveMoney(){
 const [selected,setSelected]=useState('mobile');
 const [demoAmount,setDemoAmount]=useState('100');
 const [demoDone,setDemoDone]=useState(false);

 const runDemoReceive=()=>{
  const amount=Number(demoAmount)||0;
  const added=addDemoBalance(amount);
  setVerified(true);
  setDemoDone(true);
  setDemoAmount(String(added));
 };

 return <div className="mx-auto max-w-4xl space-y-5 sm:space-y-7"><header><p className="text-[10px] font-extrabold uppercase tracking-[.18em]" style={{color:'var(--accent-strong)'}}>Incoming transfers</p><h2 className="ss-title mt-2 text-2xl font-black sm:text-3xl">Receive money</h2><p className="ss-copy mt-1 text-sm">Choose how you would like to receive a transfer when the payout rail is available.</p></header><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><section className="ss-surface rounded-[22px] p-4 sm:p-6"><h3 className="text-base font-extrabold">Preferred receiving method</h3><p className="ss-copy mt-1 text-xs">Select a preference to see the current setup status.</p><div className="mt-4 space-y-2">{options.map(({id,icon:Icon,title,detail,availability})=><button key={id} type="button" onClick={()=>setSelected(id)} className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition sm:p-4" style={{borderColor:selected===id?'var(--accent)':'var(--border)',background:selected===id?'var(--accent-soft)':'var(--surface)'}}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{background:'var(--surface-muted)',color:'var(--accent-strong)'}}><Icon size={19}/></span><span className="min-w-0 flex-1"><b className="block text-sm">{title}</b><span className="ss-copy mt-1 block text-xs">{detail}</span><span className="mt-2 inline-block rounded-full px-2 py-1 text-[9px] font-extrabold" style={{background:'var(--surface-muted)',color:'var(--muted)'}}>{availability}</span></span><span className="h-4 w-4 shrink-0 rounded-full border-2" style={{borderColor:selected===id?'var(--accent-strong)':'var(--border)',background:selected===id?'var(--accent)':'transparent'}}/></button>)}</div><div className="mt-5 rounded-xl p-4" style={{background:'var(--surface-muted)'}}><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0" style={{color:'var(--accent-strong)'}}/><div><p className="text-xs font-extrabold">Receiving details are not generated yet</p><p className="ss-copy mt-1 text-xs leading-5">This frontend currently has no backend endpoint to create a verified receive ID or confirm incoming funds. We don&apos;t generate random IDs or claim a payout method is active.</p></div></div></div><div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
  <div className="flex items-start gap-3">
   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{background:'var(--accent-soft)',color:'var(--accent-strong)'}}><ArrowDownLeft size={19}/></span>
   <div>
    <p className="text-sm font-extrabold">Demo receive</p>
    <p className="ss-copy mt-1 text-xs">Preview receiving money into your wallet. A credit is added as a demo balance and marks your account verified.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
     <input id="demo-receive-amount" type="number" min="1" inputMode="decimal" value={demoAmount} onChange={(event)=>setDemoAmount(event.target.value)} aria-label="Demo receive amount" className="w-28 rounded-xl border px-3 py-2 text-sm font-bold" style={{borderColor:'var(--border)',background:'var(--surface)'}} />
     <button type="button" onClick={runDemoReceive} disabled={!demoAmount} className="ss-press inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition active:scale-[.98]" style={{borderColor:'var(--accent)',background:'var(--accent)',color:'#17140c'}}><CheckCircle2 size={13}/> Add demo credit</button>
    </div>
    {demoDone && <p role="status" className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold" style={{color:'var(--accent-strong)'}}><CheckCircle2 size={14}/> Demo receive recorded — wallet balance now {formatWalletAmount(Number(demoAmount))}. You can now send money.</p>}
   </div>
  </div>
 </div>
 <Link to="/help" className="ss-primary mt-4 min-h-11 w-full">Contact SwiftSend support <ArrowRight size={16}/></Link></section><aside className="rounded-[22px] p-5 text-white" style={{background:'#171717'}}><span className="grid h-10 w-10 place-items-center rounded-xl" style={{background:'#e4b638',color:'#17140c'}}><ArrowDownLeft size={19}/></span><h3 className="mt-4 text-lg font-black">Receiving made clear</h3><p className="mt-2 text-xs leading-5 text-white/65">When a receiving rail is enabled, SwiftSend should provide a verified destination and a clear receipt for each incoming transfer.</p><ul className="mt-4 space-y-3 text-xs text-white/75"><li>• Verified recipient details</li><li>• Transparent payout status</li><li>• A reference you can track</li></ul></aside></div></div>};
