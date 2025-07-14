#include <iostream>
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

    pair<int, int> findLargest() {
        if (head == nullptr) {
            throw runtime_error("The list is empty.");
        }

        int maxVal = head->data;
        int maxIndex = 0;
        int currentIndex = 0;

        Node* temp = head;
        while (temp != nullptr) {
            if (temp->data > maxVal) {
                maxVal = temp->data;
                maxIndex = currentIndex;
            }
            temp = temp->next;
            currentIndex++;
        }

        return {maxVal, maxIndex};
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
    list.insert(5);
    list.insert(30);
    list.insert(15);
    cout << "Linked List: ";
    list.display();
    try {
        pair<int, int> result = list.findLargest();
        cout << "Largest element: " << result.first << " at index: " << result.second << endl;
    } catch (const runtime_error& e) {
        cout << e.what() << endl;
    }

    return 0;
}