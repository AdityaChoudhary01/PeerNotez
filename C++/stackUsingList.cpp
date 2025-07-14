#include <iostream>
using namespace std;

// Node class for the linked list
class Node {
public:
    int data;
    Node* next;

    Node(int val) : data(val), next(nullptr) {}
};

// Stack class using a linked list
class Stack {
private:
    Node* top; // Pointer to the top of the stack

public:
    Stack() : top(nullptr) {}

    // Push an element onto the stack
    void push(int val) {
        Node* newNode = new Node(val);
        newNode->next = top;
        top = newNode;
    }

    // Pop an element from the stack
    void pop() {
        if (isEmpty()) {
            cout << "Stack underflow. Cannot pop from an empty stack." << endl;
            return;
        }
        Node* temp = top;
        top = top->next;
        delete temp;
    }

    // Peek the top element of the stack
    int peek() {
        if (isEmpty()) {
            throw runtime_error("Stack is empty. Cannot peek.");
        }
        return top->data;
    }

    // Check if the stack is empty
    bool isEmpty() {
        return top == nullptr;
    }

    // Display the stack
    void display() {
        if (isEmpty()) {
            cout << "Stack is empty." << endl;
            return;
        }
        Node* temp = top;
        while (temp != nullptr) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        cout << "NULL" << endl;
    }

    // Destructor to free memory
    ~Stack() {
        while (!isEmpty()) {
            pop();
        }
    }
};

int main() {
    Stack stack;

    // Push elements onto the stack
    stack.push(10);
    stack.push(20);
    stack.push(30);

    // Display the stack
    cout << "Stack: ";
    stack.display();

    // Peek the top element
    cout << "Top element: " << stack.peek() << endl;

    // Pop an element
    stack.pop();
    cout << "After popping an element: ";
    stack.display();

    return 0;
}
