const COMMENTS_API = "https://baki.cc";

document.querySelectorAll(".comments").forEach(async (section) => {

    const post = section.dataset.post;
    const list = section.querySelector(".comment-list");
    const form = section.querySelector(".comment-form");
    const question = section.querySelector(".math-question");
    const message = section.querySelector(".comment-message");

    async function getChallenge() {
        const response = await fetch(
            `${COMMENTS_API}/challenge.php`,
            { credentials: "include" }
        );

        const data = await response.json();

        question.textContent = data.question;
    }

    async function loadComments() {
        const response = await fetch(
            `${COMMENTS_API}/comments.php?post=${encodeURIComponent(post)}`
        );

        const data = await response.json();

        list.innerHTML = "";

        data.comments.forEach(comment => {

            const article = document.createElement("article");
            article.className = "comment";

            const name = document.createElement("strong");
            name.textContent = comment.name || "Anonymous";

            const body = document.createElement("p");
            body.textContent = comment.body;

            article.appendChild(name);
            article.appendChild(body);

            list.appendChild(article);
        });
    }

    await getChallenge();
    await loadComments();

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "Posting...";

        const name = form.elements.name.value.trim();
        const body = form.elements.body.value.trim();
        const answer = form.elements.answer.value.trim();
        const website = form.elements.website.value.trim();

        try {

            const response = await fetch(
                `${COMMENTS_API}/comment.php`,
                {
                    method: "POST",
                    credentials: "include",
                    body: new URLSearchParams({
                        post: post,
                        name: name,
                        body: body,
                        answer: answer,
                        website: website
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to post comment");
            }

            message.textContent = "Comment posted!";

            form.elements.name.value = "";
            form.elements.body.value = "";
            form.elements.answer.value = "";

            await getChallenge();
            await loadComments();

        } catch (error) {

            message.textContent = error.message;

            await getChallenge();
        }
    });
});
