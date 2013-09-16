// g++ -static -o rapidid rapidid.cpp -lcrypto -lz -g -Wall -O2 -I/local/ssl/include -L/local/ssl/lib
// yangff
//
#include <openssl/md5.h>
#include <zlib.h>
#include <cstring>
#include <cstdio>
#include <cstdlib>
using namespace std;
const size_t sizelimit = 256*1024;//32768;
void work(char * file){
  FILE * f = fopen(file,"rb");
  size_t fs = sizelimit;
  if (f){
    static char buff[sizelimit];
    unsigned char md5[16];
    char final[32*3+3] = {'\0'};
    MD5_CTX ctx;
    MD5_Init(&ctx);
    if (size_t x = (fread(buff,sizeof(char),sizelimit,f)) < sizelimit) {
      fclose(f);
      printf("File size not enough (%d of %d)\n",(int)x,sizelimit);
      return ;
    };
    MD5_Update(&ctx,buff,sizelimit);
    MD5_Final(md5,&ctx);
    for(int i=0; i<16; i++ ){
      char tmp[3] = {'\0'};
      sprintf(tmp,"%.2x",md5[i]);
      strcat(final,tmp);
    }
    unsigned long crc = 0;crc = crc32 (0L, Z_NULL, 0);
    MD5_Init(&ctx);
    MD5_Update(&ctx,(const Bytef*)buff,sizelimit);
    crc = crc32(crc,(unsigned char *)buff,sizelimit);
    while (size_t x = fread(buff,sizeof(char),sizelimit-1,f)){
      MD5_Update(&ctx,buff,x);
      crc = crc32(crc,(unsigned char *)buff,x);
      fs += x;
    }
    MD5_Final(md5,&ctx);
    strcat(final,":");
    for(int i=0; i<16; i++ ){
      char tmp[3] = {'\0'};
      sprintf(tmp,"%.2x",md5[i]);
      strcat(final,tmp);
    }
    char tmp1[9] = {'\0'};
    sprintf(tmp1,"%d", (unsigned int) crc);
    strcat(final,":");
    strcat(final,tmp1);
    printf("%d:%s\n",(int)fs,final);
  } else { printf("File : '%s' not exist.",file); return;}
}
int main(int argc,char *  argv[]){
  if (argc == 1){
    printf("Usage : rapidid file1 file2 file3 ...\n");
    return 0;
  }
  for (int i = 1; i < argc; i++){
    work(argv[i]);
  }
#ifdef _WIN32
  system("pause");
#endif
}