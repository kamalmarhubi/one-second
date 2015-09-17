#include <stdlib.h>
#include <stdio.h>

int main(int argc, char **argv) {
    int NUMBER, i;
    NUMBER = atoi(argv[1]);

    char* array = malloc(NUMBER);
    int j = 1;
    for (i = 0; i < NUMBER; ++i) {
        j = j * 1331 % NUMBER;
        if (j < 0) {
            j = j + NUMBER;
        }
        array[j] = 5;
    }

    return 0;
}
