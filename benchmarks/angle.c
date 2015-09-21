#include <math.h>
#include <stdlib.h>
#include <stdio.h>

// Number to guess: We generate two random unit vectors in 
// N dimensions and calculate their dot product. How big
// can we make N in a second?

int main(int argc, char **argv) {
    int NUMBER, i;
    double sum1 = 0;
    double sum2 = 0;
    NUMBER = atoi(argv[1]);

    int* arr1 = malloc(sizeof(int) * NUMBER);
    int* arr2 = malloc(sizeof(int) * NUMBER);

    for (i = 0; i < NUMBER; ++i) {
        int rand1 = rand() % 20000 - 10000;
        int rand2 = rand() % 20000 - 10000;
        arr1[i] = rand1;
        arr2[i] = rand2;
        sum1 += rand1 * rand1;
        sum2 += rand2 * rand2;
    }

    double norm1 = sqrt(sum1);
    double norm2 = sqrt(sum2);


    double dot_product = 0;
    for (i = 0; i < NUMBER; ++i) {
        // We normalize the vectors to unit vectors here
        double x1 = ((double) arr1[i]) / norm1;
        double x2 = ((double) arr2[i]) / norm2;
        dot_product += x1 * x2;
    }

    printf("%f ", dot_product);

    return 0;
}
