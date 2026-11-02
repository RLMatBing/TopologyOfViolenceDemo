import AscentApp from "../../../components/AscentApp";
export default async function Results({params}:{params:Promise<{code:string}>}){const {code}=await params;return <AscentApp initialCode={code}/>;}
