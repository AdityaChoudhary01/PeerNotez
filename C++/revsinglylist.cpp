#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

Node* createNode(int data) {
    Node* newNode = new Node();
    newNode->data = data;
    newNode->next = nullptr;
    return newNode;
}
void insertAtEnd(Node*& head, int data) {
    Node* newNode = createNode(data);
    if (!head) {
        head = newNode;
        return;
    }

    Node* temp = head;
    while (temp->next)
        temp = temp->next;
    temp->next = newNode;
}

void printReverse(Node* head) {
    if (!head) return;             
    printReverse(head->next);       
    cout << head->data << " ";   
}

int main() {
    Node* head = nullptr;

    insertAtEnd(head, 1);
    insertAtEnd(head, 2);
    insertAtEnd(head, 3);
    insertAtEnd(head, 4);

    cout << "Linked list in reverse: ";
    printReverse(head); 
    cout << endl;

    return 0;
}
