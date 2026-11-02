"use client";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PublicGame } from "../lib/game/types";

export default function ResultsCharts({game,standings}:{game:PublicGame;standings:PublicGame["players"]}){
 const impact=[
  {metric:"Agreements",value:game.stats.cooperationAccepted+game.stats.incentivesAccepted,color:"#83d6a5"},
  {metric:"Declined",value:game.stats.cooperationDeclined+game.stats.incentivesDeclined,color:"#8fa1ad"},
  {metric:"Freezes",value:game.stats.freezes,color:"#85d3ff"},
  {metric:"Blocked",value:game.stats.freezeBlocked,color:"#a9efc2"},
  {metric:"Exhaustion",value:game.stats.exhaustionEvents,color:"#ef7079"},
  {metric:"Overdrive",value:game.stats.overdrives,color:"#ffae52"},
 ];
 const towers=standings.map(player=>({name:player.name,floors:player.floors,color:player.color}));
 return <section className="results-charts" aria-label="Match data charts">
  <article><p className="eyebrow">FINAL HEIGHTS</p><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={towers} margin={{top:6,right:6,left:-22,bottom:0}}><CartesianGrid stroke="#31414e" vertical={false}/><XAxis dataKey="name" tick={{fill:"#b5c2c9",fontSize:11}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fill:"#8fa1ad",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip cursor={{fill:"#ffffff0d"}} contentStyle={{background:"#101923",border:"1px solid #506471",color:"#e9edf0"}}/><Bar dataKey="floors" radius={0}>{towers.map(row=><Cell key={row.name} fill={row.color}/>)}</Bar></BarChart></ResponsiveContainer></div></article>
  <article><p className="eyebrow">MATCH PRESSURES</p><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={impact} margin={{top:6,right:6,left:-22,bottom:0}}><CartesianGrid stroke="#31414e" vertical={false}/><XAxis dataKey="metric" tick={{fill:"#b5c2c9",fontSize:10}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fill:"#8fa1ad",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip cursor={{fill:"#ffffff0d"}} contentStyle={{background:"#101923",border:"1px solid #506471",color:"#e9edf0"}}/><Bar dataKey="value" radius={0}>{impact.map(row=><Cell key={row.metric} fill={row.color}/>)}</Bar></BarChart></ResponsiveContainer></div></article>
 </section>;
}
