# 安装 Caddy 
install_caddy_ubuntu:
	sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
	sudo apt update
	sudo apt install caddy

# 启动 Caddy
run_caddy: 
	sudo caddy start
file:
	caddy file-server --root ./files --browse --access-log --templates --listen :8091
# 修改 Caddyfile 文件之后，reload 使得新的配置生效
reload_caddy: 
	caddy reload

# 安装 pm2
install_pm2:
	pnpm install pm2 -g

server:
	pm2 start pnpm --name "weeklyzen" -- run start --port 3013

