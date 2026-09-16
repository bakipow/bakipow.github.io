const COMMENTS_API = "https://baki.cc";

document.querySelectorAll(".comments").forEach(async (section) => {

    const post = section.dataset.post;
    const list = section.querySelector(".comment-list");
    const form = section.querySelector(".comment-form");
    const question = section.querySelector(".math-question");
    const message = section.querySelector(".comment-message");
    const submitButton = form.querySelector('button[type="submit"]');
    const bodyField = form.elements.body;

    /*
     * Create character counter.
     */

    const counter = document.createElement("small");

    counter.className = "comment-counter";
    counter.textContent = "0 / 5000";

    bodyField.parentNode.appendChild(counter);


    /*
     * Update character counter.
     */

    function updateCounter() {

        const length = bodyField.value.length;

        counter.textContent =
            `${length} / 5000`;

    }

    bodyField.addEventListener(
        "input",
        updateCounter
    );


    /*
     * Get a new math challenge.
     */

    async function getChallenge() {

        const response = await fetch(
            `${COMMENTS_API}/challenge.php`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to get math question."
            );
        }

        const data = await response.json();

        question.textContent =
            data.question;
    }


    /*
     * Load existing comments.
     */

    async function loadComments() {

        const response = await fetch(
            `${COMMENTS_API}/comments.php?post=${encodeURIComponent(post)}`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load comments."
            );
        }

        const data = await response.json();

        list.innerHTML = "";


        data.comments.forEach(comment => {

            const article =
                document.createElement("article");

            article.className = "comment";


            /*
             * Commenter's name.
             */

            const name =
                document.createElement("strong");

            name.textContent =
                comment.name || "Anonymous";


            /*
             * Date and time.
             */

            const date =
                document.createElement("small");

            const commentDate =
                new Date(
                    comment.created_at * 1000
                );

            date.textContent =
                commentDate.toLocaleString();


            /*
             * Comment body.
             */

            const body =
                document.createElement("p");

            body.textContent =
                comment.body;


            /*
             * Assemble comment.
             */

            article.appendChild(name);

            article.appendChild(date);

            article.appendChild(body);

            list.appendChild(article);

        });
    }


    /*
     * Load the initial math question
     * and existing comments.
     */

    try {

        await getChallenge();

        await loadComments();

    } catch (error) {

        message.textContent =
            error.message;
    }


    /*
     * Handle comment submission.
     */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
             * Prevent comments over 5000 characters.
             */

            if (bodyField.value.length > 5000) {

                message.textContent =
                    "Comment is too long. Maximum is 5000 characters.";

                return;
            }


            /*
             * Disable the button immediately.
             *
             * This prevents double-clicks from
             * creating duplicate comments.
             */

            submitButton.disabled = true;

            message.textContent =
                "Posting...";


            const name =
                form.elements.name.value.trim();

            const body =
                bodyField.value.trim();

            const answer =
                form.elements.answer.value.trim();

            const website =
                form.elements.website.value.trim();


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


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to post comment"
                    );
                }


                /*
                 * Successful submission.
                 */

                message.textContent =
                    "Comment posted!";


                /*
                 * Clear the form.
                 */

                form.elements.name.value = "";

                bodyField.value = "";

                form.elements.answer.value = "";


                /*
                 * Reset character counter.
                 */

                updateCounter();


                /*
                 * Get a fresh math question.
                 */

                await getChallenge();


                /*
                 * Reload comments so the new
                 * comment appears immediately.
                 */

                await loadComments();


                /*
                 * Allow another submission.
                 */

                submitButton.disabled = false;

            } catch (error) {

                message.textContent =
                    error.message;


                /*
                 * The request failed, so allow
                 * the visitor to try again.
                 */

                submitButton.disabled = false;


                /*
                 * The previous math question may
                 * have been consumed, so get a new one.
                 */

                try {

                    await getChallenge();

                } catch (challengeError) {

                    console.error(
                        challengeError
                    );
                }
            }

        }
    );

});
