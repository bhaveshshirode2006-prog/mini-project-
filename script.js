
// Get HTML elements
const employeeForm = document.getElementById("employeeForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const designationInput = document.getElementById("designation");
const salaryInput = document.getElementById("salary");
const employeeTable = document.getElementById("employeeTable");
const totalEmployees = document.getElementById("totalEmployees");
const searchInput = document.getElementById("searchInput");
const editIdInput = document.getElementById("editId");
const submitButton = document.getElementById("submitButton");

const API_URL = "/api/employees";

let employees = [];

// Fetch employees from MongoDB through the backend
async function loadEmployees() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load employees");
        }

        employees = await response.json();
        searchEmployees();
    } catch (error) {
        console.error(error);
        alert("Unable to load employees. Check whether the server is running.");
    }
}

// Display employees in the table
function displayEmployees(employeeList) {
    employeeTable.innerHTML = "";

    employeeList.forEach(function(employee) {
        const row = document.createElement("tr");

        // Create cells safely using textContent
        const values = [
            employee._id,
            employee.name,
            employee.email,
            employee.department,
            employee.designation,
            "₹" + Number(employee.salary).toLocaleString("en-IN")
        ];

        values.forEach(function(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.dataset.id = employee._id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.id = employee._id;

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        employeeTable.appendChild(row);
    });

    totalEmployees.textContent = employees.length;
}

// Search employees by name
function searchEmployees() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredEmployees = employees.filter(function(employee) {
        return employee.name.toLowerCase().includes(searchText);
    });

    displayEmployees(filteredEmployees);
}

searchInput.addEventListener("input", searchEmployees);

// Add or update employee
employeeForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const employeeData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentInput.value,
        designation: designationInput.value.trim(),
        salary: Number(salaryInput.value)
    };

    if (
        !employeeData.name ||
        !employeeData.email ||
        !employeeData.department ||
        !employeeData.designation ||
        employeeData.salary <= 0
    ) {
        alert("Please enter valid employee details!");
        return;
    }

    const editId = editIdInput.value;

    try {
        const response = await fetch(
            editId ? `${API_URL}/${editId}` : API_URL,
            {
                method: editId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save employee");
        }

        alert(editId ? "Employee updated successfully!" : "Employee added successfully!");

        employeeForm.reset();
        editIdInput.value = "";
        submitButton.textContent = "Add Employee";

        await loadEmployees();
    } catch (error) {
        alert(error.message);
    }
});

// Handle Edit and Delete buttons
employeeTable.addEventListener("click", async function(event) {
    const id = event.target.dataset.id;

    if (!id) return;

    if (event.target.classList.contains("edit-btn")) {
        const employee = employees.find(function(emp) {
            return emp._id === id;
        });

        if (employee) {
            editIdInput.value = employee._id;
            nameInput.value = employee.name;
            emailInput.value = employee.email;
            departmentInput.value = employee.department;
            designationInput.value = employee.designation;
            salaryInput.value = employee.salary;

            submitButton.textContent = "Update Employee";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    if (event.target.classList.contains("delete-btn")) {
        const confirmDelete = confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete employee");
            }

            alert("Employee deleted successfully!");
            await loadEmployees();
        } catch (error) {
            alert(error.message);
        }
    }
});

// Load saved employees when page opens
loadEmployees();
