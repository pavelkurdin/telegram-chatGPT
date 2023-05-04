build:
	docker build -t pk1000bot .
run:
	docker run -d -p 3000:3000 --name pk1000bot --rm pk1000bot