#include <iostream>
#include<algorithm>
using namespace std;

class BubbleSort {

    int* array;
    int size;

public:
    BubbleSort(int size) {
       this->size =size;
       array = new int[size];
    }

    ~BubbleSort() {
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
            for (int j = 0; j < size - 1 - i; j++) {
                if (array[j] > array[j + 1]) {
                    swap(array[j], array[j + 1]);
                    swapped = true;
                }
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

    BubbleSort bs(n);

    cout << "Insert  elements";
    bs.insertdata();
    cout << "original array: ";
    bs.printArray();

    bs.sortedArray();
    cout << "Sorted array: ";
    bs.printArray();
}

