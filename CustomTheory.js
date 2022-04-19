import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import {log, Utils} from "./api/Utils";
import {GraphQuality} from "./api/Settings";

var id = "my_custom_theory_id";
var name = "Euler's Formula";
var description = "A theory about Euler's formula.";
var authors = "peanut & Snaeky";
var version = 1;

var scale;
var currency, currency_R, currency_I;
var q1, q2, t;
var a1, a2, a3, a, aTerm;
var b1, b2, I;
var c1, c2, R;
var q = BigNumber.ONE;
var graph_t;
var dimension;
var equationLevel = 0;
var max_R, max_I;
var value_graph, value_t;
var maxCurrency;
var quaternaryEntries;

var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0, 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

var init = () => {
    scale = 0.2;
    currency = theory.createCurrency();
    currency_R = theory.createCurrency("R", "R");
    currency_I = theory.createCurrency("I", "I");

    graph_t = BigNumber.ZERO;
    value_t = BigNumber.ZERO;
    maxCurrency = BigNumber.ZERO;
    max_R = BigNumber.ZERO;
    max_I = BigNumber.ZERO;

    quaternaryEntries = [];

    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, 3.36)));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(20)));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getB1(level).toString(0);
        let getInfo = (level) => "b_1=" + getB1(level).toString(0);
        b1 = theory.createUpgrade(2, currency_R, new FirstFreeCost(ExponentialCost(20, Math.log2(200))));
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
    }

    // b2
    {
        let getDesc = (level) => "b_2=1.05^{" + level + "}";
        let getInfo = (level) => "b_2=" + getB2(level).toString(2);
        b2 = theory.createUpgrade(3, currency_R, new ExponentialCost(100, Math.log2(2)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
    }


    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(4, currency_I, new FirstFreeCost(new ExponentialCost(20, Math.log2(200))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=1.05^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(5, currency_I, new ExponentialCost(100, Math.log2(2)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level).toString(0);
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(6, currency, new FirstFreeCost(new ExponentialCost(2000, 50)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=2^{" + level + "}";
        let getInfo = (level) => "a_2=" + getQ2(level).toString(0);
        a2 = theory.createUpgrade(7, currency_R, new ExponentialCost(500, 15));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // a3
    {
        let getDesc = (level) => "a_3=2^{" + level + "}";
        let getInfo = (level) => "a_3=" + getQ2(level).toString(0);
        a3 = theory.createUpgrade(8, currency_I, new ExponentialCost(500, 15));
        a3.getDescription = (_) => Utils.getMath(getDesc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getInfo(a3.level), getInfo(a3.level + amount));
    }

    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 0.1);
    theory.createBuyAllUpgrade(1, currency, 1);
    theory.createAutoBuyerUpgrade(2, currency, 1);

    {
        let getInfo = (level) => "t=" + getT(level).toString(0);
        t = theory.createPermanentUpgrade(3, currency, new ExponentialCost(1, Math.log2(1)));
        t.getDescription = (_) => " $\\uparrow$ t multiplier by 1";
        t.getInfo = (amount) => Utils.getMathTo(getInfo(t.level), getInfo(t.level + amount));
        t.maxLevel = 8;
    }

    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(0.1, 0.1));

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Unlock the real component R" : "Unlock the imaginary component I";
        dimension.getInfo = () => Localization.getUpgradeAddDimensionDesc();
        dimension.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); theory.invalidateTertiaryEquation(); updateAvailability();}
    }

    {
        aTerm = theory.createMilestoneUpgrade(1, 3);
        aTerm.getDescription = (_) => Localization.getUpgradeAddTermDesc(aTerm.level == 0 ? "\\frac{a_1}{100}" : (aTerm.level == 1 ? "\\frac{a_1a_2}{100}" : "\\frac{a_1a_2a_3}{100}"));
        aTerm.getInfo = (_) => Localization.getUpgradeAddTermInfo("\\frac{a_1a_2}{100}");
        aTerm.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    /*

    TODO

    //// Achievements
    achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => q1.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of q2?", () => q2.level > 1);

    TODO

    //// Story chapters

    */


    updateAvailability();
}

var updateAvailability = () => {

    aTerm.isAvailable = dimension.level > 1;
    a1.isAvailable = aTerm.level > 0;
    a2.isAvailable = aTerm.level > 1;
    a3.isAvailable = aTerm.level > 2;

    b1.isAvailable = dimension.level > 0;
    b2.isAvailable = dimension.level > 0;
    c1.isAvailable = dimension.level > 1;
    c2.isAvailable = dimension.level > 1;

    currency_R.isAvailable = dimension.level > 0;
    currency_I.isAvailable = dimension.level > 1;
}

var postPublish = () => {
    scale = 0.2;
    maxCurrency = BigNumber.ZERO;
    graph_t = BigNumber.ZERO;
    q = BigNumber.ONE;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let value_q1 = getQ1(q1.level);
    let value_q2 = getQ2(q2.level);

    let value_t2 = getT(t.level);
    if(q1.level != 0) {
        value_t = value_t + ((1+value_t2)*dt / 1.5)
    }

    q += value_q1 * value_q2 * dt * bonus;

    let value_b1 = getB1(b1.level);
    let value_b2 = getB2(b2.level);
    let b = BigNumber.from(value_b1 * value_b2);

    let value_c1 = getC1(c1.level);
    let value_c2 = getC2(c2.level);
    let c = BigNumber.from(value_c1 * value_c2);

    let value_a1 = getA1(a1.level);
    let value_a2 = getA2(a2.level);
    let value_a3 = getA3(a3.level);
    a = BigNumber.from(value_a1 * value_a2 * value_a3) / BigNumber.HUNDRED;

    value_graph = value_t * ((1+currency.value).log() / 10);

    R = BigNumber.from(b * value_graph.cos()); // b * cos(t) - real part of solution
    I = BigNumber.from(c * value_graph.sin()); // c * i * sin(t) - "imaginary" part of solution
    max_R = max_R.max(R);
    max_I = max_I.max(I);

    let baseCurrencyMultiplier = dt * bonus * (aTerm.level !== 0 ? a : BigNumber.ONE);
    currency_R.value += baseCurrencyMultiplier * R.abs() ** 2;
    currency_I.value += baseCurrencyMultiplier * I.abs() ** 2;
    if(value_q1 == BigNumber.ZERO) {
        currency.value = 0;
    } else {
        graph_t += dt / 2;
        switch (equationLevel) {
            case 0:
                currency.value += baseCurrencyMultiplier * value_t * q;
                break;
            case 1:
                currency.value += baseCurrencyMultiplier * (value_t * q.pow(BigNumber.TWO) + (currency_R.value ** 2).sqrt());
                break;
            case 2:
                currency.value += (baseCurrencyMultiplier * (value_t * q.pow(BigNumber.TWO) + (currency_R.value ** 2) + (currency_I.value ** 2)).sqrt());
                break;
        }
        maxCurrency = maxCurrency.max(currency.value);
    }

    state.x = graph_t.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();

    if(graph_t > 32 + ((1 / 100) * (max_R / 1000))) {
        graph_t = 0;
        theory.clearGraph();
    }
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();
    checkForScale();
}

var checkForScale = () => {
    if(max_R > (8 / scale) / 4 || max_I > (8 / scale) / 4) { // scale down everytime R or I gets larger than the screen
        graph_t = 0;
        theory.clearGraph();
        let old_scale = scale; // save previous scale
        scale = (50 / 100) * old_scale // scale down by 50%
    }
}

// EQUATIONS
// -------------------------------------------------------------------------------
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 60;
    let result = "\\begin{array}{c}\\dot{\\rho} = ";
    switch (aTerm.level) {
        case 0:
            result += ""
            break;
        case 1:
            result += "\\frac{a_1}{100}";
            break;
        case 2:
            result += "\\frac{a_1a_2}{100}";
            break;
        case 3:
            result += "\\frac{a_1a_2a_3}{100}";
            break;
    }
    switch(dimension.level) {
        case 0:
            result += "tq\\\\";
            result += "G(t) = \\cos(t) + i\\sin(t)";
            break;
        case 1:
            result += "\\sqrt{tq^2 + R_2^{\\;2}\\text{ }}\\\\";
            result += "G(t) = b\\cos(t) + i\\sin(t)";
            break;
        case 2:
            result += "\\sqrt{\\text{\\,}tq^2 + R_2^{\\;2}\\; + \\; I_3^{\\;2}\\text{ }}\\\\";
            result += "G(t) = b\\cos(t) + ci\\sin(t)";
            break;
    }

    result += "\\end{array}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 70;
    let result = "\\begin{array}{c}";
    switch(dimension.level) {
        case 0:
            result += "\\dot{q} = tq_1q_2\\\\";
            break;
        case 1:
            result += "\\dot{q} = tq_1q_2,\\quad\\dot{R} = b_1b_2\\cos(t)\\\\";
            break;
        case 2:
            result += "\\dot{q} = tq_1q_2,\\quad\\dot{R} = b_1b_2\\cos(t),\\quad\\dot{I} = -(ic_1c_2\\sin(t))^2\\\\";
            break;
    }
    result += theory.latexSymbol + "=\\max\\rho^{0.1}";
    result += "\\end{array}"
    return result;
}

var getTertiaryEquation = () => {
    let result = "";//"\\text{q: " + q + " | max: " + maxCurrency + " | t: " + t + "}";

    result += "\\begin{matrix}q=";
    result += q.toString();
    result += ",\\;R =";
    result += BigNumber.from(R).toString(2);
    result += ",\\;I =";
    result += BigNumber.from(I).toString(2);
    result += "\\end{matrix}";

    return result;
}

var getQuaternaryEntries = () => {

    // this is used for debug

    if(quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry("sc", null));
        quaternaryEntries.push(new QuaternaryEntry("R^*", null));
        quaternaryEntries.push(new QuaternaryEntry("I^*", null));
        quaternaryEntries.push(new QuaternaryEntry("I_s", null));
        quaternaryEntries.push(new QuaternaryEntry("\\rho^*", null));
        quaternaryEntries.push(new QuaternaryEntry("t", null));
        quaternaryEntries.push(new QuaternaryEntry("g_t", null));
        quaternaryEntries.push(new QuaternaryEntry("m_t", null));
    }
    quaternaryEntries[0].value = scale;
    quaternaryEntries[1].value = max_R;
    quaternaryEntries[2].value = max_I;
    quaternaryEntries[3].value = (8 / scale) / 4;
    quaternaryEntries[4].value = maxCurrency;
    quaternaryEntries[5].value = value_t;
    quaternaryEntries[6].value = graph_t;
    quaternaryEntries[7].value = 32 + ((1 / 100) * (max_R / 1000));

    return quaternaryEntries;
}



// -------------------------------------------------------------------------------

var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.SIX;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{6}";
var isCurrencyVisible = (index) => index == 0 || (index == 1 && dimension.level > 0) || (index == 2 && dimension.level > 1);
var getTau = () => currency.value.pow(BigNumber.from(0.1));

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getN = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA2 = (level) => BigNumber.TWO.pow(level);
var getA3 = (level) => BigNumber.TWO.pow(level);
var getB1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getB2 = (level) => BigNumber.from(1.05).pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.from(1.05).pow(level);
var getT = (level) => Utils.getStepwisePowerSum(level, 1.01, 10, 1);

init();