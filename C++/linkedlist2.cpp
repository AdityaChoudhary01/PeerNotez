#include <iostream>
#include <vector>
using namespace std;
class Node {
public:
    int data;
    Node* next;

    Node(int val) : data(val), next(nullptr) {}
};
class LinkedList {
private:
    Node* head;

public:
    LinkedList() : head(nullptr) {}

    void insert(int val) {
        Node* newNode = new Node(val);
        if (head == nullptr) {
            head = newNode;
        } else {
            Node* temp = head;
            while (temp->next != nullptr) {
                temp = temp->next;
            }
            temp->next = newNode;
        }
    }
    vector<int> toArray() {
        vector<int> arr;
        Node* temp = head;
        while (temp != nullptr) {
            arr.push_back(temp->data);
            temp = temp->next;
        }
        return arr;
    }
    void fromArray(const vector<int>& arr) {
        head = nullptr;
        for (int val : arr) {
            insert(val);
        }
    }
    void display() {
        Node* temp = head;
        while (temp != nullptr) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        cout << "NULL" << endl;
    }
};

int main() {
    LinkedList list;
    list.insert(10);
    list.insert(20);
    list.insert(30);
    cout << "Original Linked List: ";
    list.display();
    vector<int> arr = list.toArray();
    cout << "Array from Linked List: ";
    for (int val : arr) {
        cout << val << " ";
    }
    cout << endl;
    LinkedList newList;
    newList.fromArray(arr);
    cout << "New Linked List from Array: ";
    newList.display();

    return 0;
}