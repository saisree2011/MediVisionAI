const healthTips = [

    {
        title: "Stay Hydrated 💧",
        content: "Drink sufficient water throughout the day to maintain proper hydration."
    },

    {
        title: "Eat a Balanced Diet 🥗",
        content: "Include fruits, vegetables, whole grains and protein-rich foods in your meals."
    },

    {
        title: "Exercise Regularly 🏃",
        content: "Regular physical activity supports heart health, strength and overall fitness."
    },

    {
        title: "Get Enough Sleep 😴",
        content: "Most adults need around 7 to 9 hours of sleep every night."
    },

    {
        title: "Maintain Personal Hygiene 🧼",
        content: "Wash your hands regularly and maintain good personal hygiene."
    },

    {
        title: "Manage Stress 🧘",
        content: "Try relaxation techniques, hobbies and regular breaks to manage everyday stress."
    },

    {
        title: "Limit Excess Salt 🧂",
        content: "Avoid consuming excessive salt and highly processed foods."
    },

    {
        title: "Take Regular Breaks 👀",
        content: "Take short breaks when working or studying for long periods."
    }

];

let currentTip = 0;

function showNextTip() {

    currentTip = (currentTip + 1) % healthTips.length;

    document.getElementById("tip-title").textContent =
        healthTips[currentTip].title;

    document.getElementById("tip-content").textContent =
        healthTips[currentTip].content;

}