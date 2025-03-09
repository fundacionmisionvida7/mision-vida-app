import webPush from 'web-push';
import fs from 'fs';

export default async (req, res) => {
  webPush.setVapidDetails(
    'mailto:contacto@misionvida.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const subscriptions = JSON.parse(fs.readFileSync('subscriptions.json', 'utf8'));
  
  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(sub, JSON.stringify({
          title: '🚨 Notificación de Prueba',
          body: '¡Funciona correctamente!',
          icon: '/icon-192x192.png'
        }));
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        return { success: false, endpoint: sub.endpoint, error: error.message };
      }
    })
  );

  res.status(200).json({ results });
};