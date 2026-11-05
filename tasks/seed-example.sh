#!/usr/bin/env bash
# Crea categorías y productos de ejemplo para el usuario indicado.
# Requiere que el backend esté en http://localhost:5082

API_URL="http://localhost:5082/api"
EMAIL="faritteranacosta@gmail.com"
PASSWORD="123456789"

TOKEN=$(curl -s "$API_URL/Auth/login" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "No se pudo obtener el token. Verifica credenciales/backend."
  exit 1
fi

# Categorías
CAT_BEBIDAS=$(curl -s "$API_URL/Categories" -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Bebidas","description":"Bebidas y líquidos"}' | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

CAT_SNACKS=$(curl -s "$API_URL/Categories" -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Snacks","description":"Aperitivos y snacks"}' | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

echo "Categorías creadas: $CAT_BEBIDAS, $CAT_SNACKS"

# Productos
curl -s "$API_URL/Products" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Coca-Cola 355ml\",\"description\":\"Refresco\",\"price\":1500,\"stock\":24,\"categoryId\":\"$CAT_BEBIDAS\",\"imageUrl\":null,\"minimumStock\":5,\"barcode\":\"7501055300123\"}"; echo
curl -s "$API_URL/Products" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Agua 500ml\",\"description\":\"Agua mineral\",\"price\":800,\"stock\":40,\"categoryId\":\"$CAT_BEBIDAS\",\"imageUrl\":null,\"minimumStock\":10,\"barcode\":\"7501055300456\"}"; echo
curl -s "$API_URL/Products" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Papas fritas\",\"description\":\"Bolsa 45g\",\"price\":1200,\"stock\":15,\"categoryId\":\"$CAT_SNACKS\",\"imageUrl\":null,\"minimumStock\":3,\"barcode\":\"7501055300789\"}"; echo
curl -s "$API_URL/Products" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Chocolate\",\"description\":\"Barra 50g\",\"price\":2000,\"stock\":0,\"categoryId\":\"$CAT_SNACKS\",\"imageUrl\":null,\"minimumStock\":5,\"barcode\":\"7501055300999\"}"; echo

echo "Datos de ejemplo creados."