rm -rf azbot && git clone https://github.com/AzRyCb/azbot && sudo apt install nodejs ffmpeg imagemagick libwebp -y && cd azbot && npm install && npm update && npm i -g pm2 && pm2 start System/index.js && pm2 save && pm2 monit