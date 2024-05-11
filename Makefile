up:
	docker compose --env-file src/.env up

up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file src/.env up --build

down:
	docker compose down