import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
console.log('DNS servers:', dns.getServers());

import mongoose from 'mongoose';
const URI = 'mongodb+srv://azizahmed:jchfksjfhskjfshkfh@app.ipk7p3c.mongodb.net/?appName=app';
console.log('Connecting...');
try {
    await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000 });
    console.log('SUCCESS - readyState:', mongoose.connection.readyState);
    await mongoose.disconnect();
} catch(e) {
    console.log('FAILED:', e.message.split('\n')[0]);
}
