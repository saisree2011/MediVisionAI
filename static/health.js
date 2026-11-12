async function calculateBMI() {
    const height = Number(document.getElementById("height").value);
    const weight = Number(document.getElementById("weight").value);
    const result = document.getElementById("bmi-result");

    if (height <= 0 || weight <= 0) {
        result.textContent = "Please enter valid height and weight.";
        return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    let category;

    if (bmi < 18.5) {
        category = "Underweight";
    } else if (bmi < 25) {
        category = "Normal weight";
    } else if (bmi < 30) {
        category = "Overweight";
    } else {
        category = "Obese";
    }

    result.textContent = "Your BMI is " + bmi.toFixed(2) +
                         " (" + category + "). Saving...";

    try {
        const response = await fetch("/api/save-health", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({height: height, weight: weight})
        });

        const data = await response.json();

        if (!response.ok) {
            result.textContent = data.error || "Unable to save metrics.";
            return;
        }

        result.textContent = "Your BMI is " + bmi.toFixed(2) +
                             " (" + category + "). Saved successfully!";
    } catch (error) {
        result.textContent = "Unable to connect to the server.";
        console.error(error);
    }
}