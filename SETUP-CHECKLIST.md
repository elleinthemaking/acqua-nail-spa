# Acqua Nail Spa website: setup checklist

Follow these in order. Everything is free except the domain name (about $12 to $20 a year).
Total time: about 45 minutes. You need a computer, not a phone.

What you are setting up:
- **GitHub** stores the website files.
- **Netlify** publishes them at a web address and provides the login for the editing page.
- **The editing page** lives at your-site/admin. The salon owner logs in there and changes
  prices, hours, photos and wording with simple forms. No code.

---

## Part A: Put the website files on GitHub

1. Go to https://github.com/signup and create a free account for yourself. Verify the email.

2. Create the repository (GitHub's word for a project folder):
   - Click the **+** in the top right, then **New repository**.
   - Repository name: `acqua-nail-spa` (exactly this, lowercase, with the dashes).
   - Leave everything else as it is. Do NOT tick "Add a README file".
   - Click **Create repository**.

3. Upload the website files:
   - On the empty repository page, click the link **uploading an existing file**.
   - Open the **Acqua Nail Spa Website** folder on your Desktop.
   - Select everything inside it (the files AND the `admin`, `content` and `images` folders)
     and drag them all onto the GitHub upload area. Use Google Chrome, which accepts folders.
   - Wait for the upload list to finish, then click **Commit changes** at the bottom.
   - Check: the repository page now lists `admin`, `content`, `images`, `index.html`,
     `netlify.toml`, `script.js`, `styles.css` and `SETUP-CHECKLIST.md`.

4. Tell the editing page which repository it belongs to:
   - In the repository, click the `admin` folder, then `config.yml`.
   - Click the pencil icon (Edit this file) at the top right.
   - On line 6, replace `YOUR-GITHUB-USERNAME` with your GitHub username. The line should
     read, for example: `repo: elleford/acqua-nail-spa`
   - Click **Commit changes**, then **Commit changes** again in the box that appears.

---

## Part B: Publish the site with Netlify

5. Go to https://app.netlify.com/signup and choose **Sign up with GitHub**. Approve the
   permission screen.

6. Connect the repository:
   - Click **Add new site** (or **Add new project**), then **Import an existing project**.
   - Choose **GitHub**. If asked, authorize Netlify and give it access to `acqua-nail-spa`.
   - Click the `acqua-nail-spa` repository.
   - Leave the build settings empty. The site needs no build step; the `netlify.toml`
     file already tells Netlify what to do.
   - Click **Deploy**. In about a minute the site is live at a random address that ends
     in `.netlify.app`.

7. Give the site a nicer temporary address:
   - Open the site in Netlify, go to **Site configuration** (or **Project configuration**),
     then **Site details**, then **Change site name**.
   - Enter `acquanailspa` and save. The site is now at https://acquanailspa.netlify.app
   - Open that address and check the site loads. Try a Book Now button.

---

## Part C: Turn on the login for the editing page

The editing page uses "Sign in with GitHub". These steps connect GitHub and Netlify so
that button works. You do this once.

8. Create a GitHub "OAuth App":
   - On GitHub, click your profile picture (top right), then **Settings**.
   - Scroll to the bottom of the left menu and click **Developer settings**.
   - Click **OAuth Apps**, then **New OAuth App**.
   - Fill in:
     - Application name: `Acqua Nail Spa editing`
     - Homepage URL: `https://acquanailspa.netlify.app`
     - Authorization callback URL: `https://api.netlify.com/auth/done`
       (type this exactly; it must be this Netlify address, not your site)
   - Click **Register application**.
   - On the next screen, copy the **Client ID** somewhere safe.
   - Click **Generate a new client secret**, and copy the secret immediately. GitHub only
     shows it once.

9. Give the two codes to Netlify:
   - In Netlify, open your site, then **Site configuration**, then **Access & security**
     (on some accounts it is called **Access control**).
   - Find the **OAuth** section and click **Install provider**.
   - Provider: **GitHub**. Paste the Client ID and the Client Secret. Click **Install**.

10. Test the editing page:
    - Go to https://acquanailspa.netlify.app/admin
    - Click **Login with GitHub** and approve.
    - You should see a menu on the left: Salon info, Packages & prices, A la carte menu,
      Our Work photos, Reviews, Policies.
    - Open **Salon info, hours & wording**, change one word, click **Publish**, then
      **Publish now**. Refresh the website after a minute. The word has changed.

---

## Part D: Give the salon owner her own login

11. She needs a GitHub account. Easiest: create one for her at https://github.com/signup
    using the salon email address, and write down the username and password for her.

12. Invite that account to the website files:
    - In your `acqua-nail-spa` repository, click **Settings** (the tab at the top of the
      repository, not your profile settings).
    - Click **Collaborators** in the left menu, then **Add people**.
    - Type her GitHub username, choose it, and click **Add**.
    - An invitation email goes to the salon address. She (or you, logged in as her)
      clicks **Accept invitation**.

13. Her routine from now on:
    - Go to https://acquanailspa.netlify.app/admin (or the real domain once it's set up).
    - Click **Login with GitHub**, sign in with her salon GitHub account.
    - Pick a section, make the change, click **Publish**, then **Publish now**.
    - The live website updates within about a minute.

---

## Part E: Use the salon's own domain name

14. Buy the domain. Two options:
    - Inside Netlify: **Domain management**, then **Add a domain**, type the name you want
      (for example `acquanailspa.com`) and follow the purchase steps. Netlify sets it up
      automatically. Easiest.
    - Or buy it at Namecheap or GoDaddy, then in Netlify choose **Add a domain you already
      own** and copy the two DNS records Netlify shows into the registrar's DNS page.

15. Wait up to an hour. Netlify turns on HTTPS (the padlock) by itself.

16. Finally, back in your GitHub OAuth App (Part C, step 8), change the Homepage URL to
    the new domain. Nothing else needs to change; the callback URL stays the same.

---

## Tips for the owner

- Prices in the Packages section are numbers only, no dollar sign. Prices in the à la
  carte menu are text, so `$30+` is fine there.
- In Packages, tick the boxes to say which packages include each service. The cards and
  the comparison table are built from those ticks automatically.
- Photos: tall (portrait) photos look best in Our Work. Add a new photo with the
  **+ Add photos** button, then **Choose an image**, then **Upload**.
- Nothing she does on the editing page can break the layout. If something looks wrong,
  she can reopen the section and change it back.

## If something goes wrong

- "Login with GitHub" does nothing or shows an error: re-check Part C. The callback URL
  must be exactly `https://api.netlify.com/auth/done` and the Client ID and Secret in
  Netlify must match the OAuth App.
- The editing page says it cannot find the repository: re-check step 4. The line must
  be `repo: your-username/acqua-nail-spa` with your real username.
- She can log in but gets "permission" errors when publishing: her account has not
  accepted the collaborator invitation (step 12).
