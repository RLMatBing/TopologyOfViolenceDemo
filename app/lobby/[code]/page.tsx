import AscentApp from "../../../components/AscentApp";
export default async function Lobby({params}:{params:Promise<{code:string}>}){const {code}=await params;return <AscentApp initialCode={code}/>;}
