#include <iostream>
#include<algorithm>
using namespace std;

class Selectionsort {

    int* array;
    int size;

public:
Selectionsort(int size) {
       this->size =size;
       array = new int[size];
    }

    ~Selectionsort() {
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
               int minIndex = i;
                for (int j = i + 1; j < size; j++) {
                    if (array[j] < array[minIndex]) {
                        minIndex = j;
                    }
                }
                if (minIndex != i) {
                    swap(array[i], array[minIndex]);
                    cout << "Swapping " << array[i] << " and " << array[minIndex] << endl;
                    swapped = true;
                }
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

    Selectionsort Ss(n);

    cout << "Insert  elements";
    Ss.insertdata();
    cout << "original array: ";
    Ss.printArray();

    Ss.sortedArray();
    cout << "Sorted array: ";
    Ss.printArray();
}
