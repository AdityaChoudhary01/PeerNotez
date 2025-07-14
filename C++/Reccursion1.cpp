#include <iostream>
using namespace std;
int sum=0;
void printsumfrom5to1usingrecursion(int i){
    if (i < 1) {
        return;
    }
    sum += i;
    printsumfrom5to1usingrecursion(i - 1); 
}
int main() {
    cout << "Printing numbers 5 to 1 using recursion: " << endl;
    printsumfrom5to1usingrecursion(5); 
    cout << "Sum of numbers from 5 to 1 is: " << sum << endl;

    return 0;
}