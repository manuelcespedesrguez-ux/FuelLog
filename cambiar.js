// 1. Cargar las variables de entorno del archivo .env
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// 2. Conectarse a Supabase usando la llave maestra de administrador
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 3. Función principal que hace todo el trabajo
async function forzarNuevaPassword(emailCliente, nuevaPassword) {
  console.log(`🔍 Buscando al cliente con correo: ${emailCliente}...`);

  // A. Listar los usuarios para encontrar su ID único (UUID)
  const { data: lista, error: errorLista } = await supabaseAdmin.auth.admin.listUsers();

  if (errorLista) {
    console.error('❌ Error al conectar con el módulo de autenticación:', errorLista.message);
    return;
  }

  const cliente = lista.users.find(u => u.email.toLowerCase() === emailCliente.toLowerCase());

  if (!cliente) {
    console.error(`❌ No se encontró ningún cliente registrado con el correo: ${emailCliente}`);
    return;
  }

  console.log(`✅ Cliente encontrado. ID Interno: ${cliente.id}`);
  console.log(`🔄 Cambiando contraseña a: "${nuevaPassword}"...`);

  // B. Modificar la contraseña del usuario usando su ID único
  const { data: usuarioActualizado, error: errorUpdate } = await supabaseAdmin.auth.admin.updateUserById(
    cliente.id,
    { password: nuevaPassword }
  );

  if (errorUpdate) {
    console.error('❌ Error al actualizar la contraseña:', errorUpdate.message);
  } else {
    console.log(`🎉 ¡Éxito! La contraseña de ${usuarioActualizado.user.email} ha sido cambiada correctamente.`);
  }
}

// =========================================================================
// 4. CONFIGURACIÓN DEL CAMBIO (Edita los valores de aquí abajo)
// =========================================================================
const CORREO_DEL_CLIENTE = 'cliente@correo.com'; // <-- Pon el correo de tu cliente
const NUEVA_CONTRASEÑA = 'Temporal2026!';       // <-- Pon la contraseña temporal que le darás

// Ejecutar el script
forzarNuevaPassword(CORREO_DEL_CLIENTE, NUEVA_CONTRASEÑA);