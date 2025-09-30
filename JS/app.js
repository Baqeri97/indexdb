let db;
const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");
const form = document.querySelector("form");
const list = document.querySelector("ol");


// create database

window.onload = () =>{
    let request = window.indexedDB.open("contacts", 1);
    request.onerror = () =>{
        console.log(" Database Failed To Open");
    }
    request.onsuccess = () =>{
        console.log("Database Opened Successfully");
       db = request.result;
       displayData();
    }
    request.onupgradeneeded = (e) =>{
        let db = e.target.result;

        let objectStore = db.createObjectStore("contacts",{
            keyPath : "id",
            autoIncrement: true
        });
        objectStore.createIndex("firstName", "firstName", {
            unique: false
        });
        objectStore.createIndex("lastName", "lastName", {
            unique: false
        });
        console.log("Database Setup Successfully");
        
    }
}

// Add person to database

const addData = (e) =>{
    e.preventDefault();
    let newItem = {firstName: firstName.value, lastName: lastName.value};
    let transaction = db.transaction(["contacts"], "readwrite");
    let objectStore = transaction.objectStore("contacts");
    let request = objectStore.add(newItem);
    request.onsuccess = () =>{
        firstName.value = "";
        lastName.value = "";
    }
    transaction.oncomplete = () =>{
        setTimeout(() =>{alert(`${newItem.firstName} ${newItem.lastName} Added To List`);}, 500);
        console.log("Transaction Completed : Database Modification Finished");
        displayData();
    }
    transaction.onerror = () =>{
        console.log("Transaction Not Completed : Database Modification Failed");
    }
}

// get list of all items from database and display in Dom

const displayData = () =>{

    // clear current displayed items

    while(list.firstChild){
        list.removeChild(list.firstChild);
    }
    // get data from database and with *cursor*, iterate through each item

    let objectStore = db.transaction("contacts").objectStore("contacts");
    objectStore.openCursor().onsuccess = (e) =>{
        let cursor = e.target.result;
        if(cursor){
            let li = document.createElement("li");
            let first = document.createElement("p");
            let last = document.createElement("p");
            let deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.float = "right";
            first.textContent = cursor.value.firstName;
            last.textContent = cursor.value.lastName;
            li.appendChild(first);
            li.appendChild(last);
            li.appendChild(deleteBtn);
            list.appendChild(li);
            li.setAttribute("data-contact-id", cursor.value.id);
            deleteBtn.addEventListener("click", deleteItem);
            cursor.continue();
        }else{
            if(!list.firstChild){
                const li = document.createElement("li");
                li.textContent = "No Contacts To Show...!!!";
                list.appendChild(li);
            }
            console.log("All Contacts Displayed");
        }
    }    
}
// Delete contact from database

const deleteItem = (e) =>{
    let contactId = Number(e.target.parentNode.getAttribute("data-contact-id"));
    let transaction = db.transaction(["contacts"], "readwrite");
    let objectStore = transaction.objectStore("contacts");
    let contactInfo = objectStore.get(contactId);

    // get the contact info before deleting

    contactInfo.onsuccess = () =>{
        let contact = contactInfo.result;
    // delete the contact

        let request = transaction.objectStore("contacts").delete(contactId);

        request.onsuccess = () =>{
           setTimeout(() =>{alert(`${contact.firstName} ${contact.lastName} Deleted From List!`);}, 500);
            displayData();
        
        }
        request.oncomplete = (e) =>{
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            if (!list.firstChild) {
                let li = document.createElement("li");
                li.textContent = "There is No Contact...!!!";
                list.appendChild(li);
            }
        }
    }    
}   
// Add submit event to form

form.addEventListener("submit", addData);
