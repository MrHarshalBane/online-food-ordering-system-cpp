#include <iostream>
#include <string>
#include <vector>
#include <limits>
using namespace std;

class FoodItem {
public:
    string name;
    double price;
    FoodItem(string n, double p) {
        name = n;
        price = p;
    }
};

class Menu {
public:
    vector<FoodItem> items;
    void addItem(const FoodItem& item) {
        items.push_back(item);
    }
    void showMenu() {
        cout << "------ MENU ------" << endl;
        for (size_t i = 0; i < items.size(); i++) {
            cout << i + 1 << ". " << items[i].name << " - Rs. " << items[i].price << endl;
        }
    }
};

class Order {
public:
    vector<FoodItem> orderedItems;
    void addOrder(const FoodItem& item) {
        orderedItems.push_back(item);
    }
    double getTotal() {
        double total = 0;
        for (size_t i = 0; i < orderedItems.size(); i++) {
            total += orderedItems[i].price;
        }
        return total;
    }
    void showOrder() {
        cout << "------ YOUR ORDER ------" << endl;
        for (size_t i = 0; i < orderedItems.size(); i++) {
            cout << orderedItems[i].name << " - Rs. " << orderedItems[i].price << endl;
        }
        cout << "Total Amount: Rs. " << getTotal() << endl;
    }
};

class Customer {
public:
    string name;
    string phone;
    string address;
    Customer(string n, string p, string a) {
        name = n;
        phone = p;
        address = a;
    }
};

int main() {
    Menu menu;
    menu.addItem(FoodItem("Pizza", 250));
    menu.addItem(FoodItem("Burger", 120));
    menu.addItem(FoodItem("Pasta", 180));
    menu.addItem(FoodItem("Sandwich", 100));
    menu.addItem(FoodItem("Cold Drink", 60));

    Order order;
    int choice = 0;
    char more = 'y';
    while (more == 'y' || more == 'Y') {
        menu.showMenu();
        cout << "Enter item number to order: ";
        cin >> choice;
        if (choice > 0 && choice <= static_cast<int>(menu.items.size())) {
            order.addOrder(menu.items[choice - 1]);
            cout << menu.items[choice - 1].name << " added to your order." << endl;
        } else {
            cout << "Invalid choice." << endl;
        }
        cout << "Do you want to add more items? (y/n): ";
        cin >> more;
    }

    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    string cname, cphone, caddress;
    cout << "Enter your name: ";
    getline(cin, cname);
    cout << "Enter your phone number: ";
    getline(cin, cphone);
    cout << "Enter your address: ";
    getline(cin, caddress);

    Customer customer(cname, cphone, caddress);

    order.showOrder();
    cout << "Name: " << customer.name << endl;
    cout << "Phone: " << customer.phone << endl;
    cout << "Address: " << customer.address << endl;
    cout << "Thank you for ordering, " << customer.name << "!" << endl;
    return 0;
}