#include <iostream>
#include<algorithm>
using namespace std;

class Insertionsort {

    int* array;
    int size;

public:
Insertionsort(int size) {
       this->size =size;
       array = new int[size];
    }

    ~Insertionsort() {
        delete[] array;
    }

    void insertdata() {
        int data;
        for(int i=0;i<size;i++){
            cin>>data;
            array[i]=data;
        }
    }
    void sortedArray(){
        bool swapped;
        for (int i = 0; i < size; i++) {
            cout<<i+1<<"";
            cout<<endl;
            swapped = false;
           
            if (!swapped) {
                break; 
            }
        }
    }

    void printArray() {
        for (int i = 0; i < size; i++) {
            cout << array[i] << " ";
        }
        cout << endl;
    }
};

int main() {
    int n;
    cout << "Enter the size";
    cin >> n;

    Insertionsort Is(n);

    cout << "Insert  elements";
    Is.insertdata();
    cout << "original array: ";
    Is.printArray();

    Is.sortedArray();
    cout << "Sorted array: ";
    Is.printArray();
}
