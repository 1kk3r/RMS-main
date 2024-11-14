import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const seleccionar = async () => {
    const { data, error } = await supabase.from('usuarios').select()
    if(data == null){
      console.log("Error en la seleccion. Intente de nuevo")
    }
    else{
      console.log(data)
    }
  }


export const registrar = async (name,password = '') =>{
    const id = Date.now() + Math.floor(Math.random()*1000)
    const { error } = await supabase
  .from('usuarios')
  .insert({ id: id, nombre: name, contraseña: password })
}

export const fetchProductos = async () => {
  const { data, error } = await supabase.from('productos').select()
  if(data == null){
    console.log("Error en la seleccion. Intente de nuevo", error);
    return [];
  }
  else{
    return data;
  }
}








/*
SELECT 
id,
  talla,
  nombre
FROM productos p,
LATERAL jsonb_array_elements(p.tamaño->'tallas') AS talla
WHERE talla->>'talla' = 'xl';

*/
`
const tamaño = { tallas: [
  {talla: 's', cantidad: 10},
  {talla: 'm', cantidad: 10},
  {talla: 'l', cantidad: 10},
  {talla: 'xl', cantidad: 10},
  {talla: 'xxl', cantidad: 10},
]
}
`