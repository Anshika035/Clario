import type { AiProvider } from "@/types/ai";
import type { Profile } from "@/types/profile";
import type { AssistantOpportunityContext } from "@/types/ai";

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function profileContext(profile: Profile | null) {
  if (!profile) {
    return "";
  }

  const details = [
    profile.year ? `year ${profile.year}` : null,
    profile.branch ? profile.branch : null,
    profile.experienceLevel ? `${profile.experienceLevel} experience level` : null,
  ].filter(Boolean);
  const interests = profile.interests.length ? `interests: ${profile.interests.join(", ")}` : "";
  const skills = profile.skills.length ? `skills: ${profile.skills.join(", ")}` : "";
  const goals = profile.goals.length ? `goals: ${profile.goals.join(", ")}` : "";
  const context = [...details, interests, skills, goals].filter(Boolean).join("; ");
  return context ? ` Based on your profile (${context}), ` : "";
}

function firstYearGuidance(profile: Profile | null) {
  const branch = profile?.branch ? ` for ${profile.branch}` : "";
  const interests = profile?.interests.filter((interest) =>
    includesAny(interest.toLowerCase(), ["web", "software", "program", "data", "design"]),
  );
  const interestNote = interests?.length
    ? ` Since you are interested in ${interests.join(" and ")}, use one small project to explore that direction.`
    : "";

  return `Short answer: in your first semester${branch}, focus on foundations rather than trying every tool. Why: one programming language, coursework, problem-solving practice, and a small project give you evidence to build on. What to do next: choose one language, learn variables/functions/collections/debugging, practise a few problems each week, and join at most one activity you can contribute to.${interestNote} Check your actual timetable and college requirements for local priorities.`;
}

function languageChoiceGuidance(profile: Profile | null) {
  const interests = profile?.interests.join(" ").toLowerCase() ?? "";
  const goals = profile?.goals.join(" ").toLowerCase() ?? "";
  const skills = profile?.skills.join(" ").toLowerCase() ?? "";
  const profileText = `${interests} ${goals} ${skills}`;
  const earlyStudent = profile?.year === 1 || profile?.experienceLevel === "beginner";
  const webDirection = includesAny(profileText, ["web", "backend", "frontend", "full stack"]);
  const competitiveDirection = includesAny(profileText, [
    "competitive programming",
    "programming contest",
    "dsa",
    "algorithms",
  ]);

  if (competitiveDirection) {
    return "Since your profile points toward competitive programming or DSA, I would lean toward C++ first: its standard library and common contest workflow can make problem practice convenient. That is general guidance, not a requirement; Java is also a valid choice. Next: pick one language and solve a small set of problems consistently. Verify which language your course or target community expects.";
  }

  if (webDirection) {
    return "Since your profile points toward web or backend development, I would lean toward Java first if you want an object-oriented backend foundation, while keeping JavaScript in your near-term learning plan for web work. C++ is still useful for fundamentals and DSA, but it is not the only practical starting point. Next: choose one small project and check which ecosystem matches it. Verify the tools used by the roles or projects you want to explore.";
  }

  if (earlyStudent) {
    return "Since you are early in your studies or still building foundations, I would choose the language used most consistently in your coursework and practise it deeply before adding a second one. C++ can be a practical starting point for programming fundamentals and DSA; Java is equally reasonable if it better matches your classes or goals. Next: learn syntax, functions, collections, debugging, and one small project. Verify your course requirements before committing.";
  }

  return "Choose the language that best matches your immediate goal and that you can practise consistently. C++ is convenient for many DSA and competitive-programming workflows; Java is a strong object-oriented option for backend or coursework paths. Next: pick one project and stay with one language long enough to build something. Verify your target course, community, or role before deciding.";
}

function mockCollegeGuidance(
  question: string,
  profile: Profile | null,
  opportunityContext: AssistantOpportunityContext | null | undefined,
) {
  const text = question.toLowerCase();
  const context = profileContext(profile);

  if (opportunityContext && includesAny(text, ["concern", "risk", "worry", "problem"])) {
    return `For ${opportunityContext.opportunity.title}, the AI analysis flags: ${opportunityContext.analysis.concerns.join("; ") || "no specific concerns were listed"}. Senior Insights include ${opportunityContext.seniorInsights.reviewCount} review(s)${opportunityContext.seniorInsights.averageRating === null ? "" : ` with a ${opportunityContext.seniorInsights.averageRating}/10 average`}. These are interpretations and personal experiences, not proof that the opportunity is good or bad. Next: verify the missing details: ${opportunityContext.analysis.missingInformation.join("; ") || "the expectations, support, and time commitment"}.`;
  }

  if (opportunityContext && includesAny(text, ["worth", "time", "apply", "should i"])) {
    return `What you provided: ${opportunityContext.opportunity.title}${opportunityContext.opportunity.organization ? ` at ${opportunityContext.opportunity.organization}` : ""}. The AI reading gives it ${opportunityContext.analysis.overallScore}/100 and says: ${opportunityContext.analysis.summary} Senior Insights are community experiences${opportunityContext.seniorInsights.averageRating === null ? "" : ` averaging ${opportunityContext.seniorInsights.averageRating}/10`}, not universal facts. ${context}Compare the learning value, likely effort, mentorship, and your goals. Before deciding, verify: ${opportunityContext.analysis.missingInformation.join("; ") || "the written expectations, time commitment, and support available"}.`;
  }

  if (opportunityContext) {
    return `I can help you weigh ${opportunityContext.opportunity.title} using the student-provided opportunity details, the AI interpretation, and senior experiences. Ask about its concerns, time cost, skills, or whether it fits your goals. I will treat senior reviews as individual experiences and point out what still needs verification.`;
  }

  if (includesAny(text, ["dsa", "data structure", "algorithm"])) {
    return "Short answer: DSA means data structures and algorithms—the ways you organise data and solve problems efficiently. Why it matters: it builds problem-solving skills used in coursework, projects, and some technical interviews. Example: use a hash map to count word frequencies instead of repeatedly scanning a list. Next: learn one language, then arrays, strings, hash maps, stacks, queues, sorting, and searching; practise a few small problems each week. Adjust the order to your course or target role.";
  }

  if (includesAny(text, ["what is c++", "what is cpp"])) {
    return "C++ is a general-purpose programming language used for software, systems, games, and many DSA or competitive-programming exercises. Why it matters: it teaches core programming concepts and gives you control over performance. Example: you can write a small program that reads numbers, stores them in a vector, and sorts them. Next: learn syntax, functions, collections, debugging, and one small project before worrying about advanced features.";
  }

  if (includesAny(text, ["what is java"])) {
    return "Java is a general-purpose programming language commonly used for applications, backend services, and coursework. Why it matters: it gives you strong object-oriented fundamentals and a large ecosystem. Example: a Java program can model a Student object and store many students in a list. Next: learn syntax, classes, collections, exceptions, and build one small project.";
  }

  if (includesAny(text, ["c++", "cpp", "java"])) {
    return languageChoiceGuidance(profile);
  }

  if (
    includesAny(text, [
      "web development",
      "web project",
      "web app",
      "website",
      "frontend",
      "front-end",
      "backend",
      "full stack",
    ])
  ) {
    return "Short answer: start with HTML, CSS, and JavaScript, then build one small responsive project. Why: HTML structures a page, CSS styles it, and JavaScript adds behaviour. Example: make a to-do list that saves items and handles empty input. Next: learn browser debugging and Git, then add one framework only after the basics feel comfortable. Choose tools based on the kind of role or project you want to pursue.";
  }

  if (includesAny(text, ["git", "github"])) {
    return "Git records changes to your code so you can review or restore work; GitHub hosts repositories and makes collaboration easier. Why it matters: projects become easier to share and explain. Example: make a commit after adding a feature, then push it to a GitHub repository. Next: learn init/clone, status, add, commit, branch, pull, push, and how to write a useful README. Never upload passwords or API keys.";
  }

  if (includesAny(text, ["project", "projects"])) {
    return "A project is a small, finished piece of work that demonstrates what you can build. Start with a problem you understand, define a small first version, and write down what you learned. Next: choose a 2–4 week project, use Git, document setup and decisions in a README, and be ready to explain your own code. A finished simple project is usually more useful than an unfinished ambitious one.";
  }

  if (includesAny(text, ["what should i learn", "skills", "learn first", "programming"])) {
    return "For a fresher, prioritise one programming language, problem-solving basics, Git, communication, and one small project. Next: pick a 4–6 week project with a clear finish line and review what you learned each week. Your starting point and available time matter, so share your branch, experience, and goal for a more tailored path.";
  }

  if (includesAny(text, ["hackathon"])) {
    return "A hackathon is a time-boxed event where people build and present a project, often in teams. Why it can help: you practise collaboration, rapid learning, and explaining a demo. Next: join a beginner-friendly event with a small idea and define a finishable scope. Verify the rules, judging criteria, schedule, ownership terms, and whether participation fits your workload.";
  }

  if (includesAny(text, ["internship"])) {
    return "An internship is meant to provide practical experience through defined work and learning. General guidance: ask what you will build, who will mentor you, expected hours, how progress is reviewed, and what the written terms say. I cannot verify a specific organisation from this question alone, so treat its claims as information to confirm before committing.";
  }

  if (includesAny(text, ["club"])) {
    return "A college club is a group organised around an interest, activity, or community. It can be useful when you will actively contribute rather than only collect a membership label. Next: attend a meeting, ask what members actually do, and choose one role or project to try. Verify the time commitment and whether the club's activities match your goals.";
  }

  if (includesAny(text, ["certification", "certifications", "certificate"])) {
    return "A certification is evidence that you completed an assessment or course, but it is not automatically proof of practical skill. Next: choose one that supports a current learning goal, complete the hands-on work, and keep a project or notes to show what you can do. Verify who issues it, what it assesses, the cost, and whether it is relevant to your target.";
  }

  if (includesAny(text, ["first year", "first-year", "freshman", "fresher"])) {
    return firstYearGuidance(profile);
  }

  if (includesAny(text, ["should i apply", "worth doing", "worth my time", "should i take", "worth it"])) {
    return "What you have told me: you are deciding whether an opportunity deserves your time. General guidance: compare the learning value, real work, mentorship, credibility signals, time cost, and alternatives. Next: write down the expected weekly hours and one concrete outcome. Verify the organiser, written terms, deliverables, supervision, costs, and what happens if you leave.";
  }

  if (includesAny(text, ["resume", "cv"])) {
    return "A fresher resume is a short, easy-to-scan record of your evidence. Include education, relevant skills, projects, activities, and links to work; describe what you did and what changed instead of listing buzzwords. Next: keep it to one clear page, remove claims you cannot explain, and tailor the emphasis to the role. Ask a mentor or career service to review formatting if available.";
  }

  if (includesAny(text, ["choose between", "compare", "two opportunities", "focus this semester", "semester"])) {
    return "Compare options against your current goal, learning value, evidence you can produce, time cost, support available, and what you would give up. Next: score each factor in a simple table and speak with someone who has direct experience. Verify the written schedule, expectations, costs, and exit conditions rather than relying on titles or promises.";
  }

  return "Short answer: start with one foundation that supports your current goal. Why: consistent practice and a small finished project are more useful than collecting disconnected tutorials. Next: tell me what you want to build, your current experience, and how much time you have so I can suggest a focused path. College rules, current deadlines, and role requirements should be checked with their official sources.";
}

export const mockAiProvider: AiProvider = {
  async analyzeOpportunity({ opportunity, profile }) {
    const title = opportunity.title || "This opportunity";
    const organization = opportunity.organization || "the organization";
    const opportunityText = `${title} ${opportunity.description} ${opportunity.category}`.toLowerCase();
    const profileLimited =
      !profile ||
      (!profile.branch &&
        !profile.experienceLevel &&
        !profile.interests.length &&
        !profile.skills.length &&
        !profile.goals.length);
    const matchedProfileTerms = profile
      ? [...new Set([...profile.interests, ...profile.skills, ...profile.goals].filter((value) =>
          opportunityText.includes(value.toLowerCase()),
        ))].slice(0, 4)
      : [];
    const matches = matchedProfileTerms.length
      ? matchedProfileTerms.map((value) => `The opportunity mentions or aligns with your ${value.toLowerCase()} focus.`)
      : profileLimited
        ? ["There is not enough profile information to identify a reliable personal match."]
        : ["The opportunity details do not clearly match a specific interest, skill, or goal you provided."];
    const gaps = profileLimited
      ? ["Complete your profile with interests, skills, and goals for a more tailored assessment."]
      : matchedProfileTerms.length
        ? ["Your profile does not show whether the expected tools or tasks match your current experience."]
        : ["The available opportunity details do not establish a strong match with your current profile."];
    const readiness = profile?.experienceLevel === "beginner"
      ? "As a beginner, treat the expected skills as a readiness checklist and confirm what support is available."
      : profile?.experienceLevel
        ? `Your ${profile.experienceLevel} experience level may support this, but the actual requirements still need confirmation.`
        : "Your readiness cannot be assessed confidently without experience-level information.";

    return {
      overallScore: 78,
      verdict: "worth_considering",
      summary: `${title} at ${organization} looks like a solid opportunity with useful practical experience and room to grow.`,
      strengths: [
        "Builds practical experience through hands-on work",
        "Offers skills that can strengthen a student portfolio",
        "Provides a clear opportunity to learn from real-world problems",
      ],
      concerns: [
        "The time commitment and mentorship structure should be confirmed",
        "The expected outcomes are not fully specified",
      ],
      skillsGained: ["Project collaboration", "Problem solving", "Technical communication"],
      learningValue: 82,
      experienceValue: 80,
      relevanceValue: 76,
      effortValue: 68,
      credibilitySignals: [
        "The opportunity includes practical project work",
        "The organization and role are clearly identified",
      ],
      missingInformation: ["Expected weekly time commitment", "Mentorship and evaluation process"],
      bestFor: ["Students building experience", "Learners seeking portfolio projects"],
      recommendation: `${matchedProfileTerms.length ? "Consider it because it connects with part of your stated direction. " : "Consider it only as a possibility until its fit is clearer. "}The biggest hesitation is the unspecified time commitment and support; verify the requirements, mentorship, and deliverables before committing.`,
      fitForYou: {
        summary: profileLimited
          ? "Personalization is limited because your profile does not contain enough information yet."
          : matchedProfileTerms.length
            ? "Some of the opportunity's focus overlaps with information you provided in your profile."
            : "The available details do not show a strong profile match yet.",
        matches,
        gaps,
        readiness,
        tradeoff:
          "Potential learning and experience value should be weighed against the effort, support, and time commitment, which are not fully specified.",
        profileLimited,
      },
      evidence: [
        { claim: "The opportunity includes hands-on work.", kind: "user_provided" },
        { claim: "It could strengthen a student portfolio.", kind: "ai_interpretation" },
        { claim: "Mentorship details should be verified.", kind: "unverified" },
      ],
    };
  },

  async collegeChat({ messages, profile, opportunityContext }) {
    const latestQuestion = messages.at(-1)?.content ?? "";
    return { content: mockCollegeGuidance(latestQuestion, profile, opportunityContext) };
  },
};
