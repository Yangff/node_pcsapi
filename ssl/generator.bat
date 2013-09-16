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
openssl genrsa -out yangff.key 1024
openssl req -new -key yangff.key -out yangff.csr
openssl x509 -req -in yangff.csr -out yangff.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in yangff.crt -text -noout
