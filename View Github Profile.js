let loadingCard = document.querySelector("#loadingCard")
let submit = document.querySelector("#submit")
let userimp = document.querySelector("#username")
let profilecard = document.querySelector("#profileCard")

function getprofiledata(username) {
    return fetch(`https://api.github.com/users/${username}`).then(raw => {
        if (!raw.ok) throw new Error("User not found");
        return raw.json();
    });
}

function getrepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`).then(res => {
        if (!res.ok) throw new Error("Could not fetch repos");
        return res.json();
    });
}

function showdetails(details) {
    profilecard.innerHTML = `
        <button id="closeCard" class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">
            &times;
        </button>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <!-- Profile Photo -->
            <div class="w-28 h-28 rounded-full overflow-hidden border border-gray-400 shadow">
                <img id="avatar" src="${details.avatar_url}" alt="Profile Photo" class="w-full h-full object-cover">
            </div>

            <!-- Basic Info -->
            <div class="flex-1">
                <h2 id="name" class="text-2xl font-semibold text-white mb-1">${details.name ? details.name : "NA"}</h2>
                <p id="bio" class="text-sm text-gray-400 mb-4">${details.bio ? details.bio : "No bio available"}</p>

                <div class="flex gap-10 text-sm text-gray-400 mb-3">
                    <p><strong id="followers" class="font-medium">${details.followers}</strong> Followers</p>
                    <p><strong id="following" class="font-medium">${details.following}</strong> Following</p>
                </div>

                <a id="githubLink" href="${details.html_url}" target="_blank"
                    class="inline-block mt-1 px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition">
                    View GitHub Profile
                </a>
            </div>
        </div>

        <!-- Company and Blog Section -->
        <div class="mt-8">
            <h3 class="text-lg font-medium text-white mb-2 border-b border-gray-500 pb-1">Company & Blog</h3>
            <ul class="text-sm text-gray-400">
                <li><strong>Company:</strong> <span id="company">${details.company ? details.company : "NA"}</span></li>
                <li><strong>Blog:</strong> ${details.blog ? `<a href="${details.blog}" target="_blank" class="text-blue-500 hover:underline">${details.blog}</a>` : "NA"}</li>
            </ul>
        </div>

        <!-- Repositories Section -->
        <div class="mt-8">
            <h3 class="text-lg font-medium text-white mb-2 border-b border-gray-500 pb-1">Top 5 Repositories</h3>
            <ul id="repos" class="list-disc list-inside text-sm text-gray-400 space-y-1"></ul>
        </div>
    `;

    // Attach close button event
    document.querySelector("#closeCard").addEventListener("click", () => {
        profilecard.classList.add("hidden");
        userimp.value = "";
    });
}

submit.addEventListener("click", function (event) {
    event.preventDefault();
    loadingCard.classList.remove("hidden");
    profilecard.classList.add("hidden");

    let user = userimp.value.trim();

    if (user.length === 0) {
        profilecard.classList.remove("hidden");
        loadingCard.classList.add("hidden");
        profilecard.innerHTML = `<p style="color:maroon;">Enter a valid user name</p>`;
        return;
    }

    // Optional: Validate GitHub username format
    if (!/^[a-zA-Z0-9-]+$/.test(user)) {
        profilecard.classList.remove("hidden");
        loadingCard.classList.add("hidden");
        profilecard.innerHTML = `<p style="color:maroon;">Invalid GitHub username</p>`;
        return;
    }

    getprofiledata(user).then((data) => {
        console.log(data);
        loadingCard.classList.add("hidden");
        profilecard.classList.remove("hidden");
        showdetails(data);

        // Fetch and display repositories
        getrepos(user).then((repos) => {
            const repolist = document.querySelector("#repos");
            if (repos.length > 0) {
                repos.forEach(repo => {
                    const li = document.createElement("li");
                    li.innerHTML = `<a href="${repo.html_url}" target="_blank" class="hover:underline text-blue-400">${repo.name}</a>`;
                    repolist.appendChild(li);
                });
            } else {
                repolist.innerHTML = "<li>No repositories found</li>";
            }
        }).catch((err) => {
            console.error("Repo fetch error:", err);
            document.querySelector("#repos").innerHTML = "<li>Error fetching repositories</li>";
        });

    }).catch((error) => {
        console.error("API Error:", error);
        profilecard.classList.remove("hidden");
        loadingCard.classList.add("hidden");
        profilecard.innerHTML = `<p style="color:maroon;">User not found</p>`;
    });
});
