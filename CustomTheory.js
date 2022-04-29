import {CustomCost, ExponentialCost, FreeCost, LinearCost} from "./api/Costs";
import { Localization } from "./api/Localization";
import {BigNumber, parseBigNumber} from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import {log, Utils} from "./api/Utils";
import {GraphQuality} from "./api/Settings";
import {ui} from "./api/ui/UI";

var id = "eulers_formula";
var name = "Euler's Formula";
var description = "You're a student hired by a professor at a famous university. Since your works have received a bit of attention from your colleagues, you decide to go into a subject not yet covered by your professor, which has interested you since day 1 of deciding to study mathematics - Complex Numbers. \n" +
    "You hope that with your research into this subject, you can finally get the breakthrough you always wanted in the scientific world.\n" +
    "\n" +
    "This theory explores the world of complex numbers, their arrangement and proves that i is an integral part of mathematics, on which basic math is functioning on. The theory, named after famous mathematician Leonhard Euler and first stated by Roger Cotes in 1714, explores the relationship between exponential functions and trigonometric functions.\n" +
    "Your task is to use this formula, and with the help of the Pythagorean theorem, calculate the distances of cos(t) and isin(t) from the origin, and grow them as large as possible using many different methods and even modifying the formula using multipliers of sine and cosine!\n" +
    "\n" +
    "Huge thanks to:\n" +
    "\n" +
    "- Gilles-Philippe, for implementing integral features we proposed, helping us a *ton* during development, answering our questions and giving us beta features to use in our theories! \n" +
    "\n" +
    "- XLII, for helping us a *ton* during balancing, deciding various integral features of the theory such as but not limited to: milestone placement, milestone costs, publish multipliers and a lot more!\n" +
    "\n" +
    "- The entire discord community, who've playtested this theory and reported many bugs, especially those active at #custom-theories-dev\n" +
    "\n" +
    "and of course a personal thanks from peanut to:\n" +
    "\n" +
    "- Snaeky, without whom this theory would not have been possible as he was the one with the original idea of structuring a theory around Euler's Formula, and always answering my questions and motivating all of us to push this theory forwards.\n" +
    "\n" +
    "We hope you enjoy playing this theory as much as we had developing it and coming up with ideas for it!\n" +
    "\n" +
    "- The Eulers-Formula-CT Development Team"

var authors = "Snaeky (SnaekySnacks#1161) - Idea, General Structuring\n" +
    "peanut (peanut#6368) - Developer"

var version = "RC-29042022\\_1";

// init variables
var currency, currency_R, currency_I;
var quaternaryEntries;

// upgrade variables
var q1, q2;
var a1, a2, a3;
var b1, b2;
var c1, c2;
var q = BigNumber.ONE;
var nuclear_option, nuclear_bool;

// milestone variables
var a_base, a_exp;
var b_base, c_base;
var dimension;

// graph variables
var scale;
var R = BigNumber.ZERO;
var I = BigNumber.ZERO;
var t_graph = BigNumber.ZERO;   // distance from origin to current x value
var t_speed;                    // multiplies dt by given value (1 + t_multiplier * dt)
var t = BigNumber.ZERO;         // time elapsed ( -> cos(t), sin(t) etc.)
var max_R, max_I;

// vector variables
var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0, 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

// story variables
var chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9;

// currency achievements
var achievement1, achievement2, achievement3, achievement4,  achievement5, achievement6, achievement7, achievement8, achievement9, achievement10;

// publish achievements
var achievement11, achievement12, achievement13, achievement14,  achievement15, achievement16, achievement17, achievement18, achievement19, achievement20;
var num_publish = 0;


var init = () => {
    scale = 0.2;
    currency = theory.createCurrency();
    currency_R = theory.createCurrency("R", "R");
    currency_I = theory.createCurrency("I", "I");

    max_R = BigNumber.ZERO;
    max_I = BigNumber.ZERO;

    quaternaryEntries = [];

    // Regular Upgrades

    // t
    {
        let getDesc = (level) => "\\dot{t}=" + BigNumber.from(0.2 + (0.2 * t_speed.level)).toString(t_speed.level > 3 ? 0 : 1);
        let getInfo = (level) => "\\dot{t}=" + BigNumber.from(0.2 + (0.2 * t_speed.level)).toString(t_speed.level > 3 ? 0 : 1);
        t_speed = theory.createUpgrade(0, currency, new ExponentialCost(1e6, Math.log2(1e6)));
        t_speed.getDescription = (_) => Utils.getMath(getDesc(t_speed.level));
        t_speed.getInfo = (amount) => Utils.getMathTo(getInfo(t_speed.level), getInfo(t_speed.level + amount));
        t_speed.maxLevel = 4;
    }

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(1.61328))));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(2, currency, new ExponentialCost(5, Math.log2(60)));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getB1(level).toString(0);
        let getInfo = (level) => "b_1=" + getB1(level).toString(0);
        b1 = theory.createUpgrade(3, currency_R, new FirstFreeCost(ExponentialCost(20, Math.log2(200))));
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
    }

    // b2
    {
        let getDesc = (level) => "b_2=" + (1.1 + (0.01 * b_base.level)) + "^{" + level + "}";
        let getInfo = (level) => "b_2=" + getB2(level).toString(2);
        b2 = theory.createUpgrade(4, currency_R, new ExponentialCost(100, Math.log2(2)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
    }


    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(5, currency_I, new FirstFreeCost(new ExponentialCost(20, Math.log2(200))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=" + (1.1 + (0.0125 * b_base.level)) + "^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(2);
        c2 = theory.createUpgrade(6, currency_I, new ExponentialCost(100, Math.log2(2)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level).toString(0);
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(7, currency, new FirstFreeCost(new ExponentialCost(2000, 2.2)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=" + getA2(level).toString(0);
        let getInfo = (level) => "a_2=" + getA2(level).toString(0);
        a2 = theory.createUpgrade(8, currency_R, new ExponentialCost(500, 2.2));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // a3
    {
        let getDesc = (level) => "a_3=2^{" + level + "}";
        let getInfo = (level) => "a_3=" + getQ2(level).toString(0);
        a3 = theory.createUpgrade(9, currency_I, new ExponentialCost(500, 2.2));
        a3.getDescription = (_) => Utils.getMath(getDesc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getInfo(a3.level), getInfo(a3.level + amount));
    }


    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

    // let theory explode
    {
        nuclear_option = theory.createPermanentUpgrade(3, currency, new FreeCost());
        nuclear_option.getDescription = (_) => "Let theory explode";
        nuclear_option.getInfo = (amount) => "$q_2\\; \\rightarrow \\;q_2^{10}$";
        nuclear_option.boughtOrRefunded = (_) => nuclear_bool = !nuclear_bool;
    }


    // Milestone Upgrades
    theory.setMilestoneCost(new CustomCost(total => BigNumber.from(total < 5 ? 4*(1+total) : 20 + 8*(total-4))));

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Unlock the real component R" : "Unlock the imaginary component I";
        dimension.getInfo = () => Localization.getUpgradeAddDimensionDesc();
        dimension.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); theory.invalidateTertiaryEquation(); updateAvailability(); }
        dimension.refunded = (_) => {
            if(dimension.level == 1) {
                a_base.level = 0;
                a_exp.level = 0;
            }
        }
    }

    {
        a_base = theory.createMilestoneUpgrade(1, 3);
        a_base.getDescription = (_) => Localization.getUpgradeAddTermDesc(a_base.level > 0 ? (a_base.level > 1 ? "a_3" : "a_2") : "a_1");
        a_base.getInfo = (_) => Localization.getUpgradeAddTermInfo(a_base.level > 0 ? (a_base.level > 1 ? "a_3" : "a_2") : "a_1");
        a_base.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        a_exp = theory.createMilestoneUpgrade(2, 5);
        a_exp.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc(a_base.level > 0 ? (a_base.level > 1 ? (a_base.level > 2 ? "a_1a_2a_3" : "a_1a_2") : "a_1") : "a_1", "0.1");
        a_exp.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo(a_base.level > 0 ? (a_base.level > 1 ? (a_base.level > 2 ? "a_1a_2a_3" : "a_1a_2") : "a_1") : "a_1", "0.1");
        a_exp.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        b_base = theory.createMilestoneUpgrade(3, 2);
        b_base.getDescription = (_) => "$\\uparrow  b_2$ base by 0.01";
        b_base.getInfo = (_) => "Increases $b_2$ base by 0.01";
        b_base.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
        b_base.refunded = (_) => {
            c_base.level = 0;
        }
    }

    {
        c_base = theory.createMilestoneUpgrade(4, 2);
        c_base.getDescription = (_) => "$\\uparrow  c_2$ base by 0.0125";
        c_base.getInfo = (_) => "Increases $c_2$ base by 0.0125";
        c_base.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }



    // Achievements
    var achievement_category_1 = theory.createAchievementCategory(0, "Currencies");
    var achievement_category_2 = theory.createAchievementCategory(1, "Publications");

    achievement1 = theory.createAchievement(0, achievement_category_1, "First Time", "Publish your findings once.", () => num_publish >= 1);
    achievement2 = theory.createAchievement(1, achievement_category_1, "Not a fad?", "Publish 2 Times.", () => num_publish >= 2);
    achievement3 = theory.createAchievement(2, achievement_category_1, "I recognize this name!", "Publish 5 Times.", () => num_publish >= 5);
    achievement4 = theory.createAchievement(3, achievement_category_1, "Famous Publicist", "Publish 10 Times.", () => num_publish >= 10);
    achievement5 = theory.createAchievement(4, achievement_category_1, "Senior Writer", "Publish 25 Times.", () => num_publish >= 25);
    achievement6 = theory.createAchievement(5, achievement_category_1, "Lead Author", "Publish 50 Times.", () => num_publish >= 50);

    achievement11 = theory.createAchievement(11, achievement_category_2, "First Time", "Publish your findings once.", () => num_publish >= 1);
    achievement12 = theory.createAchievement(12, achievement_category_2, "Not a fad?", "Publish 2 Times.", () => num_publish >= 2);
    achievement13 = theory.createAchievement(13, achievement_category_2, "I recognize this name!", "Publish 5 Times.", () => num_publish >= 5);
    achievement14 = theory.createAchievement(14, achievement_category_2, "Famous Publicist", "Publish 10 Times.", () => num_publish >= 10);
    achievement15 = theory.createAchievement(15, achievement_category_2, "Senior Writer", "Publish 20 Times.", () => num_publish >= 20);
    achievement16 = theory.createAchievement(16, achievement_category_2, "Lead Author", "Publish 30 Times.", () => num_publish >= 30);


    // Story chapters

    let storyChapter1 = "";
    storyChapter1 += "You approach your professor with a problem you found.\n"
    storyChapter1 += "You say, \"Professor, all the other experts in our field keep saying that this equation can't be used to further our research, but I think I can get something out of it.\"\n"
    storyChapter1 += "You hand him the paper with the equation:\n";
    storyChapter1 += "e^ix = cos(x) + i * sin(x).\n\n"
    storyChapter1 += "He looks at you and says,\n";
    storyChapter1 += "This is Euler's Formula, are you sure you can get work out of something that has imaginary numbers?\"\n";
    storyChapter1 += "\"Yes! I believe I can!\", you reply to him with anticipation.\n";
    storyChapter1 += "He gives you the green light to work on the project.";
    chapter1 = theory.createStoryChapter(0, "Circular Reasoning", storyChapter1, () => q1.level == 0); // unlocked at beginning of the theory

    let storyChapter2 = "";
    storyChapter2 += "As you start your research, you realize:\n"
    storyChapter2 += "This is much harder than you anticipated.\n"
    storyChapter2 += "You start experimenting with this formula,\n";
    storyChapter2 += "However, you cannot figure out how to modify it yet.\n";
    storyChapter2 += "Your motivation, however, is higher than ever though,\n";
    storyChapter2 += "and you cant wait to progress further with this.";
    chapter2 = theory.createStoryChapter(1, "Anticipation", storyChapter2, () => currency.value > BigNumber.from(1e7)); // unlocked at rho = 1e7

    let storyChapter3 = "";
    storyChapter3 += "After several months of working on this as a side project,\n"
    storyChapter3 += "you finally figure it out:\n\n"
    storyChapter3 += "You figured out how to modify the equation.\n";
    storyChapter3 += "You try to modify the cosine value,\n";
    storyChapter3 += "and give it a new name: R.\n";
    storyChapter3 += "You start experimenting with R,\n";
    storyChapter3 += "and try to figure out what happens,\n";
    storyChapter3 += "when you modify it.";
    chapter3 = theory.createStoryChapter(2, "A Breakthrough", storyChapter3, () => dimension.level == 1); // unlocked at R dimension milestone

    let storyChapter4 = "";
    storyChapter4 += "Interesting.";
    storyChapter4 += "You see that the modification did something to the partical.";
    storyChapter4 += "It's not affecting Rho, but its doing something.";
    storyChapter4 += "You decide that doing the same to the complex component is a good idea. ";
    storyChapter4 += "i is going to be interesting to deal with...";
    storyChapter4 += "You name it I and continue your calculations.";
    chapter4 = theory.createStoryChapter(3, "Complex Progress", storyChapter4, () => dimension.level == 2); //unlocked at I dimension milestone




    updateAvailability();
}

// INTERNAL FUNCTIONS
// -------------------------------------------------------------------------------
var updateAvailability = () => {

    a_base.isAvailable = dimension.level > 1;
    a_exp.isAvailable = a_base.level > 0;

    a1.isAvailable = a_base.level > 0;
    a2.isAvailable = a_base.level > 1;
    a3.isAvailable = a_base.level > 2;

    b1.isAvailable = dimension.level > 0;
    b2.isAvailable = dimension.level > 0;
    c1.isAvailable = dimension.level > 1;
    c2.isAvailable = dimension.level > 1;

    b_base.isAvailable = (a_exp.level == 5 && a_base.level == 3);
    c_base.isAvailable = (a_exp.level == 5 && a_base.level == 3 && b_base.level == 2);

    currency_R.isAvailable = dimension.level > 0;
    currency_I.isAvailable = dimension.level > 1;
}

var postPublish = () => {
    scale = 0.2;
    t_graph = BigNumber.ZERO;
    t = BigNumber.ZERO;
    q = BigNumber.ONE;
    num_publish++;
}

var getInternalState = () => `${num_publish} ${q} ${t}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseInt(values[0]);
    if (values.length > 1) q = parseBigNumber(values[1]);
    if (values.length > 2) t = parseBigNumber(values[2]);
    theory.clearGraph();
    state.x = t_graph.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();
}

var checkForScale = () => {
    if(max_R > 1.5 / scale || max_I > 1.5 / scale) { // scale down everytime R or I gets larger than the screen
        t_graph = BigNumber.ZERO;
        theory.clearGraph();
        state.x = t_graph.toNumber();
        state.y = R.toNumber();
        state.z = I.toNumber();
        let old_scale = scale; // save previous scale
        scale = (50 / 100) * old_scale // scale down by 50%
    }
}

var getEquationOverlay = (_) => {
    let result = ui.createLatexLabel({text: version, displacementY: 4, displacementX: 4, fontSize: 9, textColor: Color.TEXT_MEDIUM});
    return result;
}

var get3DGraphTranslation = () => swizzles[0]((new Vector3(-t_graph.toNumber() + 6, 0, 0) - center) * scale);

var tick = (elapsedTime, multiplier) => {

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    // q calc
    let vq1 = getQ1(q1.level);
    let vq2 = getQ2(q2.level);
    q += vq1 * vq2.pow(nuclear_bool ? BigNumber.TEN : BigNumber.ONE) * dt * bonus;

    // t calc
    if(q1.level != 0) {
        t += ((1 + t_speed.level) / 5) * dt;
    }

    // a calc
    let va1 = getA1(a1.level);
    let va2 = getA2(a2.level);
    let va3 = getA3(a3.level);
    let va_exp = getAExp(a_exp.level);
    let va_base = BigNumber.ONE;
    switch (a_base.level) {
        case 0:
            va_base = BigNumber.ONE;
            break;
        case 1:
            va_base = va1;
            break;
        case 2:
            va_base = va1 * va2;
            break;
        case 3:
            va_base = va1 * va2 * va3;
            break;
    }
    let a = va_base.pow(va_exp);

    // b calc
    let vb1 = getB1(b1.level);
    let vb2 = getB2(b2.level);
    let b = BigNumber.from(vb1 * vb2);

    // c calc
    let vc1 = getC1(c1.level);
    let vc2 = getC2(c2.level);
    let c = BigNumber.from(vc1 * vc2);

    // these R and I values are used for coordinates on the graph
    R = BigNumber.from(b * t.cos()); // b * cos(t) - real part of solution
    I = BigNumber.from(c * t.sin()); // c * i * sin(t) - "imaginary" part of solution
    max_R = max_R.max(R);
    max_I = max_I.max(I);

    let base_currency_multiplier = dt * bonus;

    t_graph += dt / (scale * BigNumber.TEN);

    // CURRENCY CALC
    // this check exists to stop rho from growing when every variable is 0
    // q1 = 0 basically means at start of every pub
    if(q1.level == 0) {
        currency.value = 0;
        currency_I.value = 0;
        currency_R.value = 0;
    } else {
        // rho calculation
        switch (dimension.level) {
            case 0:
                currency.value += base_currency_multiplier * (t * q.pow(BigNumber.TWO)).sqrt();
                break;
            case 1:
                currency.value += base_currency_multiplier * (t * q.pow(BigNumber.TWO) + (currency_R.value).pow(BigNumber.TWO)).sqrt();
                break;
            case 2:
                currency.value += base_currency_multiplier * a * (t * q.pow(BigNumber.TWO) + (currency_R.value).pow(BigNumber.TWO) + (currency_I.value).pow(BigNumber.TWO)).sqrt();
                break;
        }

        // R calculation
        if(dimension.level > 0) {
            currency_R.value += base_currency_multiplier * (R.abs()).pow(BigNumber.TWO);
        } else {
            currency_R.value = 0;
        }

        // I calculation
        if(dimension.level > 1) {
            currency_I.value += base_currency_multiplier * (I.abs()).pow(BigNumber.TWO);
        } else {
            currency_I.value = 0;
        }
    }

    // graph drawn
    state.x = t_graph.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();

    // constantly check for scale
    checkForScale();

}
// -------------------------------------------------------------------------------


// EQUATIONS
// -------------------------------------------------------------------------------
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 80;

    // let everything be centered -> "{c}"
    let result = "\\begin{array}{c}\\dot{\\rho} = ";

    // let a draw on equation
    let a_eq_term = ""; // whole a term drawn
    let a_eq_base = ""; // only a base
    let a_eq_exp = getAExp(a_exp.level).toString(1); // only a exponent
    switch(a_base.level) {
        case 0:
            a_eq_base = "";
            break;
        case 1:
            a_eq_base = "a_1";
            break;
        case 2:
            a_eq_base = "a_1a_2";
            break;
        case 3:
            a_eq_base = "a_1a_2a_3";
            break;
    }

    // if a has been unlocked, show a term
    if(a_base.level > 0) {
        a_eq_term = a_eq_base;
    }
    // if a has an exponent, show exponent only when bigger than lvl 0
    if(a_exp.level > 0) {
        a_eq_term = a_eq_base + "^{\\;" + a_eq_exp + "}\\,";
    }
    // show brackets when exponent is shown and a base is bigger than lvl 1
    if(a_exp.level > 0 && a_base.level > 1) {
        a_eq_term = "(" + a_eq_base + ")" + "^{" + a_eq_exp + "}";
    }

    result += a_eq_term; // put everything onto equation

    switch(dimension.level) {
        case 0:
            result += "\\sqrt{tq^2}\\\\";
            result += "G(t) = r_x + i_y";
            break;
        case 1:
            result += "\\sqrt{\\text{\\,}tq^2 + R^2\\text{ }}\\\\";
            result += "G(t) = r_x + i_y";
            break;
        case 2:
            result += "\\sqrt{\\text{\\,}tq^2 + R^2 + I^2\\text{ }}\\\\";
            result += "G(t) = r_x + i_y";
            break;
    }

    result += "\\end{array}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 50;
    let result = "\\begin{array}{c}";

    if(nuclear_bool) {
        result += "\\text{Nuclear option activated}\\\\"
    }
    switch(dimension.level) {
        case 0:
            result += "r_x = \\cos(t),\\quad i_y = i\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2";
            break;
        case 1:
            result += "r_x = b_1b_2\\cos(t),\\quad i_y = i\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2, \\quad\\dot{R} = (r_x)^2";
            break;
        case 2:
            result += "r_x = b_1b_2\\cos(t),\\quad i_y = ic_1c_2\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2, \\quad\\dot{R} = (r_x)^2, \\quad\\dot{I} = -(i_y)^{2}";
            break;
    }

    result += "\\end{array}"

    return result;
}

var getTertiaryEquation = () => {
    let result = theory.latexSymbol + "=\\max\\rho^{0.4}";
    return result;
}

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry("q", null));
        quaternaryEntries.push(new QuaternaryEntry("t", null));
        quaternaryEntries.push(new QuaternaryEntry("r_x", null));
        quaternaryEntries.push(new QuaternaryEntry("i_y", null));
    }

    quaternaryEntries[0].value = q.toString(2);
    quaternaryEntries[1].value = t.toString(2);
    quaternaryEntries[2].value = R.toString(2);
    quaternaryEntries[3].value = I.toString(2) + "i";

    return quaternaryEntries;
}
// -------------------------------------------------------------------------------

var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.387);
var getPublicationMultiplierFormula = (symbol) => symbol + "^{0.387}";
var isCurrencyVisible = (index) => index == 0 || (index == 1 && dimension.level > 0) || (index == 2 && dimension.level > 1);
var getTau = () => currency.value.pow(BigNumber.from(0.4));

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA2 = (level) => Utils.getStepwisePowerSum(level, 40, 10, 1);
var getA3 = (level) => BigNumber.TWO.pow(level);
var getAExp = (level) => BigNumber.from(1 + 0.1 * level);
var getB1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getB2 = (level) => BigNumber.from(1.1 + (0.01 * b_base.level)).pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.from(1.1 + (0.0125 * c_base.level)).pow(level);
var getT = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);

init();