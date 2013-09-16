@echo off
openssl genrsa -des3 -out ca.key 2048
openssl req -new -x509 -days 1024 -key ca.key -out ca.crt
openssl x509 -in ca.crt -text -noout
pause
echo Server CA
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr
openssl x509 -req -in server.csr -out server.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 1024
openssl x509 -in server.crt -text -noout
echo User CA
openssl genrsa -out User.key 1024
openssl req -new -key User.key -out User.csr
openssl x509 -req -in User.csr -out User.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in User.crt -text -noout
echo Create p12
openssl pkcs12 -export -in User.crt -inkey User.key -name "User" -out User.p12
