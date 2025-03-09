import webPush from 'web-push';
import fs from 'fs';

export default async (req, res) => {
  webPush.setVapidDetails(
   'mailto:contacto@misionvida.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  if (req.method === 'POST') {
    try {
      const subscription = req.body.subscription;
      
      // Leer archivo de subscriptions
      let subscriptions;
      try {
        const data = fs.readFileSync('subscriptions.json', 'utf8');
        subscriptions = data? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error leyendo subscriptions.json:', error);
        subscriptions = []; // Inicializar como un arreglo vacío si no se puede leer
      }
      
      if (!subscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
        subscriptions.push(subscription);
        fs.writeFileSync('subscriptions.json', JSON.stringify(subscriptions));
      }

      // Enviar notificación de confirmación
      await webPush.sendNotification(subscription, JSON.stringify({
        title:'Activación Exitosa',
        body: '¡Recibirás la Palabra cada día a las 8 AM!',
        icon: '/icon-192x192.png'
      }));

      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Error interno',
        details: error.message 
      });
    }
  } else {
    res.status(405).end();
  }
};