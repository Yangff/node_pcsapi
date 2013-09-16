@echo off
openssl pkcs12 -export -in yangff.crt -inkey yangff.key -name "Yangff" -out yangff.p12
start yangff.p12