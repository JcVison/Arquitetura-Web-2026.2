const base=import.meta.env.VITE_API_URL||'http://localhost:3001/api';
let token=sessionStorage.getItem('token');
export function setToken(value){token=value;if(value)sessionStorage.setItem('token',value);else sessionStorage.removeItem('token');}
export async function api(path,options={}){const response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:options.body?JSON.stringify(options.body):undefined});if(response.status===204)return null;const data=await response.json();if(!response.ok){const error=new Error(data.message||'Erro na requisição.');error.status=response.status;throw error;}return data;}
