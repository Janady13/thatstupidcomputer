/** Public editorial source: visible page copy, metadata, navigation and Service markup. */
export const SITE_ORIGIN = 'https://thatstupidcomputer.com';
export const SITE_NAME = 'That Stupid Computer';
export const SITE_SOCIAL_IMAGE = {
  url: `${SITE_ORIGIN}/images/tsc-workshop-social.png`,
  alt: 'The illustrated That Stupid Computer workshop, with a vintage computer and workbench',
  width: 1200,
  height: 630,
};
export type RoutePath = '/' | '/services/' | '/services/website-design/' | '/services/website-rescue/' | '/services/search-visibility/' | '/services/website-care/' | '/work/' | '/process/' | '/about/' | '/contact/' | '/privacy/';
export interface ContentLink { label: string; href: RoutePath }
export interface ContentSection { id?: string; heading: string; paragraphs?: string[]; items?: string[]; links?: ContentLink[]; sources?: Array<{ label: string; href: string }> }
export interface SitePage {
  path: RoutePath;
  title: string;
  description: string;
  navLabel: string;
  eyebrow: string;
  heading: string;
  intro: string;
  purpose: string;
  parent: RoutePath | null;
  sections: ContentSection[];
  relatedPaths: RoutePath[];
  cta: ContentLink;
  service?: { name: string; serviceType: string; description: string };
}
const contact: ContentLink = { label: 'Get my demo', href: '/contact/' };
export const ROUTES: SitePage[] = [
  {
    path: '/', title: 'Websites with personality. Built to work.',
    description: 'Website design, rescue, search visibility and ongoing care. Explore the workshop, then tell That Stupid Computer what your website needs to do.',
    navLabel: 'Home', eyebrow: 'A little character. A lot of purpose.',
    heading: 'Less stupid. More business.',
    intro: 'Distinctive websites. Clear next steps. A little personality. Let’s make your corner of the internet work for your business.',
    purpose: 'Introduce the website-development offer and help a visitor choose a relevant next step.', parent: null,
    sections: [
      { heading: 'What brings you to the workshop?', paragraphs: ['Maybe you are starting from a blank page. Maybe the site you already have is slow, confusing or quietly losing inquiries. Start with the problem you can see; we can work out the right scope together.'], links: [
        { label: 'I need a new website', href: '/services/website-design/' },
        { label: 'My current website needs help', href: '/services/website-rescue/' },
        { label: 'People need to find and understand my site', href: '/services/search-visibility/' },
        { label: 'I need help keeping it running', href: '/services/website-care/' },
      ] },
      { heading: 'Play a little. Then get somewhere.', paragraphs: ['Meet the computer, then explore the office: the bulletin board, the clock, the desk drawer and the coffee mug each lead somewhere. Every destination also has a direct link, so you can take the scenic route or go straight to what you need.'], links: [{ label: 'See this website in action', href: '/work/' }, { label: 'See how a project works', href: '/process/' }] },
      { heading: 'Start with a conversation, not a specification.', paragraphs: ['You do not need a technical brief to get started. Share what you do, what is getting in your way and what a better website would make possible. If you have an existing site, include its address.'] },
    ], relatedPaths: ['/services/', '/work/', '/process/', '/contact/'], cta: contact,
  },
  {
    path: '/services/', title: 'Website services', description: 'Choose a starting point for a new website, a website repair, better search visibility or ongoing website care. Scope begins with the problem you need to solve.',
    navLabel: 'Services', eyebrow: 'Choose your starting point', heading: 'A website problem deserves a useful answer.',
    intro: 'Different websites need different kinds of attention. These four starting points help frame the conversation. The work itself is scoped around your goals, existing setup and what needs to change.',
    purpose: 'Compare the four service areas and route visitors to the right brief.', parent: '/',
    sections: [
      { heading: 'A new website', paragraphs: ['Turn your business, offer and visual identity into a clear website. Plan the pages, content, interactions and inquiry path together.'], links: [{ label: 'Explore website design', href: '/services/website-design/' }] },
      { heading: 'A website that needs rescuing', paragraphs: ['Start with the symptoms, inspect the existing site and decide what can be repaired before committing to a rebuild.'], links: [{ label: 'Explore website rescue', href: '/services/website-rescue/' }] },
      { heading: 'A website that needs to be understood', paragraphs: ['Give people and search systems useful content, clear page relationships and accurate information about what you offer.'], links: [{ label: 'Explore search visibility', href: '/services/search-visibility/' }] },
      { heading: 'A website that needs ongoing attention', paragraphs: ['Discuss updates, monitoring, backups and practical support around the system you actually use.'], links: [{ label: 'Explore website care', href: '/services/website-care/' }] },
      { id: 'project-cost', heading: 'What does it cost?', paragraphs: ['There is no fixed price published here because a repair, a small new site and an application have different scopes. Share the goal and any budget or timing constraints so the conversation can begin with a realistic fit. Work, cost and responsibilities need to be agreed before a project starts.'] },
    ], relatedPaths: ['/services/website-design/', '/services/website-rescue/', '/services/search-visibility/', '/services/website-care/', '/process/'], cta: contact,
  },
  {
    path: '/services/website-design/', title: 'Website design and development', description: 'Plan and build a distinctive website around your business, your content and the actions visitors need to take. Discuss scope, design and a practical launch plan.',
    navLabel: 'Website design', eyebrow: 'Build something that feels like you', heading: 'A clear idea. A distinctive website.',
    intro: 'Your website should explain what you do, make the next step obvious and give people a reason to remember you. Design and development work best when those decisions are made together.',
    purpose: 'Explain new website scope, decisions and the information required to begin.', parent: '/services/',
    service: { name: 'Website design and development', serviceType: 'Website design and development', description: 'Website planning, design and development scoped around business goals, content and visitor tasks.' },
    sections: [
      { heading: 'Start with the job the website needs to do', paragraphs: ['Who is it for? What do they need to understand? What should happen next? Those questions shape the pages and the design before a visual direction becomes a finished build.'], items: ['Page structure and a clear path to an inquiry.', 'Content planning around real services and customer questions.', 'Visual design and interactions that support the message.', 'Responsive development, practical checks and a considered handoff.'] },
      { heading: 'Make personality useful', paragraphs: ['A memorable interaction should help a visitor understand, explore or act. This workshop is one approach; a quieter layout may be the right answer for your business. The design should serve the people using it.'] },
      { heading: 'What to bring', paragraphs: ['An outline of your business and the purpose of the site is enough to begin. Existing branding, example sites, draft content and known integrations are useful if you have them. Tell me about any launch date and who will maintain the site afterward.'] },
      { heading: 'What happens next', paragraphs: ['The first step is a fit and scope conversation. The proposed pages, responsibilities, review points, costs and launch requirements can then be made explicit before work begins.'], links: [{ label: 'Read the project process', href: '/process/' }] },
    ], relatedPaths: ['/work/', '/process/', '/services/website-care/', '/contact/'], cta: { label: 'Describe your new website', href: '/contact/' },
  },
  {
    path: '/services/website-rescue/', title: 'Website rescue and repair', description: 'Tell us what is going wrong with your website. Start with diagnosis, prioritize the problem and decide whether repair or a rebuild makes sense.',
    navLabel: 'Website rescue', eyebrow: 'Let’s find the actual problem', heading: 'Your website is acting up. Start here.',
    intro: 'A broken form, a confusing mobile layout or a page that takes too long to load can make a good business hard to reach. Before replacing everything, identify what is failing and what it would take to put it right.',
    purpose: 'Explain problem-led diagnosis and repair without implying guaranteed emergency support.', parent: '/services/',
    service: { name: 'Website rescue', serviceType: 'Website diagnosis and repair', description: 'Assessment and scoped repair of existing website problems, with rebuild options considered when appropriate.' },
    sections: [
      { heading: 'Describe the symptom', paragraphs: ['Share the page address, what you expected to happen and what happened instead. A screenshot or a short set of steps can help distinguish a visible design issue from a hosting, browser or application problem.'], items: ['Forms that fail or leave you unsure whether inquiries arrived.', 'Mobile layouts that hide content or make actions difficult.', 'Slow pages, broken links or confusing navigation.', 'An unfinished website or a change that introduced a regression.'] },
      { heading: 'Understand before changing', paragraphs: ['A useful assessment separates observed failures from assumptions, considers the existing platform and identifies dependencies. Any repair scope should explain the likely cause, the proposed change and how the result will be checked.'] },
      { id: 'repair-or-rebuild', heading: 'Can you repair my website without rebuilding it?', paragraphs: ['Often, a specific failure can be repaired without replacing the whole website. The decision starts with whether the current platform can still support your content, security needs and customer journey—not whether someone prefers a different framework.'], items: ['Repair when the cause is isolated and the existing site can be maintained safely.', 'Consider a rebuild when essential changes keep colliding with unsupported software, fragile integrations or a structure that no longer fits the business.', 'Compare the actual work, disruption, ownership and ongoing maintenance before choosing. A new design alone does not fix a broken inquiry pipeline.'], links: [{ label: 'Compare new website design', href: '/services/website-design/' }] },
      { id: 'public-website-testing', heading: 'Why does it work for me but not for my customers?', paragraphs: ['Your device may be using a private connection, an old cached response or a different network route. A page loading on the hosting server proves something different from that same page loading for a visitor.'], items: ['Repeat the problem using the exact public address, outside the private connection.', 'Check the secure connection, redirects and the actual response from that address.', 'Repeat the customer’s task on the affected browser and device. Record the failing step, not just a screenshot of the homepage.'] },
      { id: 'form-delivery', heading: 'The form says sent. Did the message arrive?', paragraphs: ['Not necessarily. A browser confirmation, acceptance by a mail server and arrival in your inbox are separate events. A useful repair follows one authorized test message through those stages and checks the destination, including filtering, instead of changing the button text to say success.'], links: [{ label: 'See how this site handles a project brief', href: '/contact/' }] },
      { heading: 'Keep the first message safe', paragraphs: ['Send the public website address and a description of the issue. Do not send passwords, access tokens or customer records in the project form. If access is needed, an appropriate way to share it can be agreed separately.'] },
    ], relatedPaths: ['/services/website-design/', '/services/website-care/', '/process/', '/contact/'], cta: { label: 'Tell me what is broken', href: '/contact/' },
  },
  {
    path: '/services/search-visibility/', title: 'SEO and AI search visibility', description: 'Technical SEO and AI-search improvements for Google, Bing, ChatGPT, Claude and Perplexity: clear answers, provider-specific access checks and evidence-based measurement.',
    navLabel: 'Search visibility', eyebrow: 'Be clear. Be useful. Be findable.', heading: 'Help the right people understand what you do.',
    intro: 'Help the right people find a useful answer—and find you. Search visibility work connects a reachable website, clear explanations of your services and accurate facts with separate checks for Google, Bing, ChatGPT, Claude and Perplexity.',
    purpose: 'Explain SEO and AI-search scope, evidence requirements and outcome limits.', parent: '/services/',
    service: { name: 'Search visibility', serviceType: 'Technical SEO and website content improvement', description: 'Scoped technical SEO, page-structure, content and structured-data improvements with evidence-based measurement.' },
    sections: [
      { id: 'search-visibility-scope', heading: 'What does the work actually include?', paragraphs: ['The scope starts with your website and the questions your customers need answered. A useful improvement should leave you with something you can inspect, not an unexplained AI score.'], items: ['A page-by-page check of public access, redirects, canonical addresses and discovery rules.', 'Clear answer destinations for real services and customer decisions, with gaps called out.', 'Consistent public business facts, visible content and appropriate structured data.', 'Separate provider checks for search discovery, model training and user-requested retrieval.', 'A measured baseline and a record of the changes, tests and results that can actually be observed.'] },
      { heading: 'Google Search and Gemini: check the right control', paragraphs: ['AI Overviews and AI Mode depend on Search eligibility and the site’s Search generative AI setting in Search Console. Gemini’s documented training and grounding uses have a separate Google-Extended control. Treating those as one switch can hide the real issue.'], sources: [{ label: 'Google’s Search AI participation control', href: 'https://support.google.com/webmasters/answer/16908024' }, { label: 'Google-Extended’s documented scope', href: 'https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended' }] },
      { heading: 'ChatGPT: discovery is different from training', paragraphs: ['OAI-SearchBot is the search-discovery control. GPTBot concerns training, while ChatGPT-User handles certain user-requested visits. The checks need to match the purpose: allowing training is not proof that ChatGPT will find, use or cite a page.'], sources: [{ label: 'OpenAI’s crawler controls', href: 'https://developers.openai.com/api/docs/bots' }] },
      { heading: 'Claude: search and direct retrieval both matter', paragraphs: ['Claude-SearchBot and Claude-User serve different discovery and retrieval roles; ClaudeBot is the training crawler. Anthropic documents its own robots behavior and source-IP list. A request carrying a Claude name still needs verification before it is reported as genuine crawler activity.'], sources: [{ label: 'Anthropic’s crawler guidance', href: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler' }] },
      { heading: 'Perplexity: verify the source, not just the name', paragraphs: ['PerplexityBot supports search rather than foundation-model training. Perplexity-User can retrieve pages for a person’s request and generally ignores robots rules. Their published address lists are separate. Neither a bot name nor an allow rule is proof that an answer used the page.'], sources: [{ label: 'Perplexity’s crawler and retrieval guidance', href: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers' }] },
      { heading: 'Bing and Copilot: keep the source current', paragraphs: ['Bing’s discovery and indexing systems also support grounded AI experiences. Canonical links, a current sitemap and change notifications help communicate which pages are current. Preview and archive directives need care because they can restrict how content appears in Copilot. An accepted submission is a receipt, not an indexing result.'], sources: [{ label: 'Bing’s webmaster guidelines', href: 'https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a' }] },
      { id: 'bing-backlinks', heading: 'Does Bing register every backlink?', paragraphs: ['No. Bing’s backlink report is a representative sample of detected links, not a complete inventory. A business identity reference, a canonical relationship and a clickable link from another page are different things. An empty detail list does not prove that no links exist.'], items: ['Compare the exact referring page and destination, not just the business name.', 'Keep your own published relationships separate from links observed by Bing.', 'Treat sitemap submissions and IndexNow notifications as discovery messages, not backlink registration or ranking credit.'], sources: [{ label: 'Bing’s backlink reporting limits', href: 'https://www.bing.com/webmasters/help/backlinks-c3a334e8' }] },
      { heading: 'Mistral: three separate crawler roles', paragraphs: ['MistralAI-Index builds the search index; MistralAI-User retrieves pages for user questions; MistralAI-Training concerns model training. Their controls are independent. Mistral publishes address lists for Index and User, so their identity can be checked without a model API key.'], sources: [{ label: 'Mistral’s publisher crawler specification', href: 'https://docs.mistral.ai/robots' }] },
      { heading: 'Grok and DeepSeek: separate documented support from assumptions', paragraphs: ['Keep accurate answers available on their public, canonical pages. The official documentation reviewed for these products did not establish a publisher-specific citation file or a verified crawler identity contract. A model API’s citation fields describe returned answers; they are not tags to paste into a website. Publisher support must not be held up by credentials for optional API tests.'], sources: [{ label: 'Grok web-search documentation', href: 'https://docs.x.ai/developers/tools/web-search' }, { label: 'DeepSeek’s developer documentation', href: 'https://api-docs.deepseek.com/' }] },
      { id: 'useful-ai-answers', heading: 'What makes a page useful in an AI answer?', paragraphs: ['A clear answer to a real question, enough context to interpret it correctly and evidence for the claims. A repair page should explain when repair makes sense, what needs testing and what a customer should provide. A comparison should make the tradeoffs understandable. The format follows the question.'], items: ['State the answer clearly, then explain the conditions and limitations.', 'Support factual claims with relevant sources or genuine, approved work examples.', 'Keep the same facts available to people and automated readers.', 'Give the reader a useful next step; do not create a page for every keyword variation.'], links: [{ label: 'See a practical repair-or-rebuild explanation', href: '/services/website-rescue/' }] },
      { id: 'provider-specific-support', heading: 'Does every AI model need the same integration?', paragraphs: ['No. Separate provider modules should handle the controls, API requests, response formats and measurement that each product actually supports. A shared registry can connect those modules while the public answers and approved business facts stay consistent. That is different from maintaining competing copies of the business for each model.'], items: ['Write in the language your customers use; these pages use English.', 'Use the provider’s documented data format for an integration, rather than inventing a special writing language.', 'Keep useful answers visible on their canonical pages. Google explicitly does not require special AI files or special schema.', 'Record the exact model and interface used in a test. A developer API result is not automatically a result from its consumer chat product.'], sources: [{ label: 'Google’s AI-search optimization guidance', href: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide' }] },
      { id: 'measuring-visibility', heading: 'How do we measure whether it helped?', paragraphs: ['Keep access, visibility and visits separate. A verified crawler request shows retrieval activity. An indexed page shows index inclusion. A captured AI answer can show a citation. Website analytics can show an attributable visit. None of those observations alone proves an inquiry or a sale.'], items: ['Compare the same pages and reporting windows, with releases noted.', 'Record the exact AI product, question, date and cited page when sampling answers.', 'Keep a completed answer without a citation separate from an unavailable test.', 'Report the limits alongside the results. Rankings and AI source selection remain the provider’s decision.'] },
      { heading: 'Bring your starting point', paragraphs: ['Share the website, the services you want it to explain and the questions customers ask. Existing search reports can help if you have access to them. A lack of account data is a gap to acknowledge, not a reason to invent a baseline.'], links: [{ label: 'See how work is scoped', href: '/process/' }] },
    ], relatedPaths: ['/services/website-rescue/', '/services/website-design/', '/process/', '/contact/'], cta: { label: 'Discuss your search visibility', href: '/contact/' },
  },
  {
    path: '/services/website-care/', title: 'Ongoing website care', description: 'Discuss practical ongoing support for your website: updates, backups, monitoring and small improvements, with responsibilities and response expectations agreed in scope.',
    navLabel: 'Website care', eyebrow: 'Keep the good work working', heading: 'A website needs attention after launch.',
    intro: 'Content changes. Software changes. A working contact form still needs to work next month. Website care is a conversation about the regular attention your particular site needs.',
    purpose: 'Describe possible maintenance scope and prevent unsupported availability promises.', parent: '/services/',
    service: { name: 'Website care', serviceType: 'Website maintenance and support', description: 'Ongoing website maintenance and support with tasks, access, responsibilities and response expectations agreed in scope.' },
    sections: [
      { heading: 'Build a care plan around the site', items: ['Review the platform, hosting and integrations already in use.', 'Agree which updates and content changes are included.', 'Define backup, recovery and monitoring responsibilities.', 'Set a contact route and realistic response expectations.', 'Review recurring problems and prioritize useful improvements.'] },
      { heading: 'Know who is responsible for what', paragraphs: ['Hosting, domain registration, software subscriptions and third-party services may have different owners. A useful care agreement makes those boundaries clear and identifies who can act when something needs attention.'] },
      { heading: 'Need a repair first?', paragraphs: ['An existing problem may need a separate assessment before recurring maintenance makes sense. Tell me what is working, what is unreliable and whether you have access to the current site and hosting accounts.'], links: [{ label: 'Explore website rescue', href: '/services/website-rescue/' }] },
      { heading: 'Set expectations before committing', paragraphs: ['Agree coverage, frequency, cost and response times around the actual site. Make the regular tasks and the process for an unexpected problem clear before committing to ongoing care.'] },
    ], relatedPaths: ['/services/website-rescue/', '/process/', '/contact/'], cta: { label: 'Discuss care for your website', href: '/contact/' },
  },
  {
    path: '/work/', title: 'Inside this interactive website', description: 'Explore That Stupid Computer as a live website demonstration: an illustrated office, purposeful interactions and a direct route from discovery to a project brief.',
    navLabel: 'Work', eyebrow: 'The workshop is the demonstration', heading: 'You are already looking at a piece of the work.',
    intro: 'This website explores a simple idea: a service website can have a strong personality while helping people understand an offer and take a clear next step. The illustrated office turns those choices into places to explore.',
    purpose: 'Provide verifiable first-party work evidence without unsupported client results or endorsements.', parent: '/',
    sections: [
      { heading: 'A familiar room, a practical job', paragraphs: ['The office is a way into the website. Its objects open information about services, the process and getting in touch. Direct navigation is available too, because choosing where to go should remain straightforward.'] },
      { heading: 'What you can assess for yourself', items: ['Explore the office and open a destination.', 'Read a service page and compare it with the other options.', 'Change the viewport size and use the direct navigation.', 'Start the project brief and review the questions before sending.'] },
      { heading: 'From first impression to a conversation', paragraphs: ['The design connects a memorable first impression to practical decisions: what kind of help you need, how a project works and what to include in a brief. Follow that path to see how the pieces fit together.'], links: [{ label: 'Follow the project process', href: '/process/' }] },
      { heading: 'What should your website feel like?', paragraphs: ['Your project does not need an animated office. It needs an approach that fits your audience, content and goals. Share what you want people to understand or feel, and the design conversation can start there.'], links: [{ label: 'Explore website design', href: '/services/website-design/' }] },
    ], relatedPaths: ['/services/website-design/', '/process/', '/contact/'], cta: { label: 'Let’s talk about your idea', href: '/contact/' },
  },
  {
    path: '/process/', title: 'How a website project works', description: 'From the first brief to scope, design, build and handoff: a practical website project process with clear decisions, review points and launch responsibilities.',
    navLabel: 'Process', eyebrow: 'Make the next step clear', heading: 'Good websites start with good questions.',
    intro: 'The exact steps depend on the work. A small repair and a new website need different plans, but both benefit from a shared understanding of the problem, the scope and how success will be checked.',
    purpose: 'Set project expectations from inquiry through scoped delivery and care.', parent: '/',
    sections: [
      { heading: '01 / Tell the story', paragraphs: ['Share what your business does, what your website needs to achieve and what is getting in the way. Existing pages, examples, deadlines and constraints make the first conversation more useful.'] },
      { heading: '02 / Agree the scope', paragraphs: ['Define the work, deliverables, responsibilities, cost and review points. Identify the content and access needed, the things outside the scope and the checks that will support acceptance.'] },
      { heading: '03 / Design, build and review', paragraphs: ['Use the agreed direction to develop the site or repair. Review work at appropriate points, connect feedback to the original goals and make any scope changes explicit.'] },
      { heading: '04 / Check the complete path', paragraphs: ['Review the actual visitor tasks, content and key technical behavior. A launch plan should include the public pages, inquiry route, access needed for deployment and a way to recover if a release goes wrong.'] },
      { heading: '05 / Hand over and keep learning', paragraphs: ['Agree who owns the accounts, content and ongoing tasks. Review the available evidence after launch, separate observations from assumptions and decide what deserves attention next.'], links: [{ label: 'Explore ongoing website care', href: '/services/website-care/' }] },
      { heading: 'You can start without all the answers', paragraphs: ['The project brief is a starting point, not a contract. Describe the goal in your own words. Details that are still undecided can be worked through during scoping.'] },
    ], relatedPaths: ['/services/', '/work/', '/contact/'], cta: { label: 'Start with your story', href: '/contact/' },
  },
  {
    path: '/about/', title: 'About That Stupid Computer', description: 'The idea behind That Stupid Computer: approachable website design and development, clear decisions and a little personality in the process.',
    navLabel: 'About', eyebrow: 'The thinking behind the workshop', heading: 'Technology should make your day easier.',
    intro: 'That Stupid Computer is a place to start a conversation about a better website. The name acknowledges a familiar frustration. The work begins by turning that frustration into a problem that can be understood and addressed.',
    purpose: 'Explain the public website approach while approved identity is inherited from the canonical truth projection.', parent: '/',
    sections: [
      { heading: 'Approachable by design', paragraphs: ['You should be able to explain a website problem without knowing the name of the technology behind it. Plain language, concrete examples and clear responsibilities make collaboration easier.'] },
      { heading: 'Personality with a purpose', paragraphs: ['The office and its characters bring a playful idea to life. The service information and project brief give that idea a practical purpose. A distinctive website still needs to answer ordinary questions clearly.'] },
      { heading: 'Clear decisions, useful progress', paragraphs: ['Start by understanding the goal. Agree what needs to change, make room for feedback and check the important visitor tasks before launch. That keeps the conversation connected to what the website is supposed to do.'], links: [{ label: 'Explore the site demonstration', href: '/work/' }, { label: 'See the approach to a project', href: '/process/' }] },
      { heading: 'Let’s make the website useful', paragraphs: ['If you need a new website, help with an existing one or a clearer path from visitors to inquiries, describe the situation. The next step is understanding what you need and whether the work is a fit.'] },
    ], relatedPaths: ['/work/', '/services/', '/contact/'], cta: contact,
  },
  {
    path: '/contact/', title: 'Start a website project', description: 'Tell That Stupid Computer about your website, what you need and what is getting in the way. Begin a conversation about a new build, repair, search visibility or care.',
    navLabel: 'Contact', eyebrow: 'Let’s make a plan', heading: 'What is your website supposed to do?',
    intro: 'Request a website demo by telling me a little about your business and what you want to change. Bring a detailed brief or just the problem; the next conversation can establish the right format and scope.',
    purpose: 'Collect a minimal project brief and explain the inquiry handoff accurately.', parent: '/',
    sections: [
      { heading: 'A few details go a long way', items: ['Your name and an email address for the conversation.', 'Whether you need a new website, a repair, search visibility or ongoing care.', 'What you want the website to help your business do.', 'Your current website, timing and budget constraints if you know them.'] },
      { heading: 'What happens after you send?', paragraphs: ['The form sends the project brief by email when the inquiry service is available. Its confirmation means the mail service accepted the request for sending; it does not confirm arrival in the inbox or that a person has read it. A project or appointment is agreed through a follow-up conversation.'] },
      { heading: 'Keep sensitive information out', paragraphs: ['Please do not include passwords, access tokens, payment details or private customer information. If a project needs access to an existing system, a suitable method can be agreed separately.'], links: [{ label: 'Read how inquiry information is handled', href: '/privacy/' }] },
    ], relatedPaths: ['/services/', '/process/', '/privacy/'], cta: { label: 'Start the project brief', href: '/contact/' },
  },
  {
    path: '/privacy/', title: 'Privacy and website inquiries', description: 'How this website handles project inquiries and optional measurement, what to leave out of the form and how to raise a question about your information.',
    navLabel: 'Privacy', eyebrow: 'Your information', heading: 'Share the project. Keep the secrets.',
    intro: 'The project brief asks for the information needed to discuss your website. Avoid sending sensitive records or account credentials. This notice describes the site’s inquiry and measurement features.',
    purpose: 'Explain actual inquiry handling and optional measurement without inventing retention or legal claims.', parent: '/',
    sections: [
      { heading: 'Project inquiries', paragraphs: ['The form uses the name, email address and project details you choose to provide to prepare an inquiry email. The website does not maintain a separate submissions database. Messages and replies may remain in the email systems used for the conversation.'] },
      { heading: 'Technical operation', paragraphs: ['Hosting and email services process the information needed to serve pages and send a message. The site may process request information to reject abuse. Do not include information about other people unless you have an appropriate reason to share it.'] },
      { heading: 'Optional measurement', paragraphs: ['Where optional analytics is configured, it is loaded only after you choose to allow it. You can change that choice using the analytics controls. Inquiry text, your name and your email address are not included in the site’s analytics events.'] },
      { heading: 'Questions about your information', paragraphs: ['Use the contact page to ask a privacy question or request that an inquiry be located, corrected or removed where possible. Include enough context to identify the conversation, without sending additional sensitive information.'], links: [{ label: 'Open the contact page', href: '/contact/' }] },
    ], relatedPaths: ['/contact/', '/about/'], cta: { label: 'Contact about your information', href: '/contact/' },
  },
];

export function getPage(path: string): SitePage | undefined {
  // Match the server's finite 200/308 inventory. Do not normalize unknown paths
  // into content that would replace a genuine 404 during client hydration.
  return ROUTES.find((page) => page.path === path || (page.path !== '/' && page.path.slice(0, -1) === path));
}
export const SERVICE_PAGES = ROUTES.filter((page) => Boolean(page.service));
export const NAVIGATION = ROUTES.filter((page) => ['/', '/services/', '/work/', '/process/', '/about/', '/contact/'].includes(page.path));
