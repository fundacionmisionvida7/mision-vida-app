import webPush from 'web-push';

export default async (req, res) => {
  webPush.setVapidDetails(
    'mailto:contacto@misionvida.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  if (req.method === 'POST') {
    try {
      const subscription = req.body.subscription;
      
      // Debug: Verificar datos recibidos
      console.log('Suscripción recibida:', subscription);
      
      // Enviar notificación de prueba inmediata
      await webPush.sendNotification(subscription, JSON.stringify({
        title: '✅ Activación Exitosa',
        body: '¡Ya recibirás la Palabra cada día!',
        icon: '/icon-192x192.png',
        url: '/'
      }));

      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Error detallado:', {
        message: error.message,
        statusCode: error.statusCode,
        body: error.body
      });
      res.status(500).json({ 
        error: 'Error interno',
        details: error.message 
      });
    }
  } else {
    res.status(405).end();
  }
};