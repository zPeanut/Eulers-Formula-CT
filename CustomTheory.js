import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import { Utils } from "./api/Utils";
import {GraphQuality} from "./api/Settings";

var id = "my_custom_theory_id";
var name = "Euler's Formula";
var description = "A basic theory.";
var authors = "Gilles-Philippe Paillé";
var version = 1;

var scale=0.2;
var currency;
var q1, q2;
var b1, b2, I;
var c1, c2, R;
var a1, a2, a, aTerm;
var q1Exp, q2Exp;
var t;
var q = BigNumber.ONE;
var dimension;
var equationLevel = 0;


var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0, 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

var init = () => {
    currency = theory.createCurrency();

    t = BigNumber.ZERO;

    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(2))));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount))
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "b_1=" + getQ1(level).toString(0);
        b1 = theory.createUpgrade(2, currency, new ExponentialCost(20, 1.5));
        b1.level = 1;
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
    }

    // b2
    {
        let getDesc = (level) => "b_2=2^{" + level + "}";
        let getInfo = (level) => "b_2=" + getQ2(level).toString(0);
        b2 = theory.createUpgrade(3, currency, new ExponentialCost(50, Math.log2(10)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
    }


    // c1
    {
        let getDesc = (level) => "c_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "c_1=" + getQ1(level).toString(0);
        c1 = theory.createUpgrade(4, currency, new ExponentialCost(20, 1.5));
        c1.level = 1;
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getQ2(level).toString(0);
        c2 = theory.createUpgrade(5, currency, new ExponentialCost(50, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "a_1=" + getQ1(level).toString(0);
        a1 = theory.createUpgrade(6, currency, new ExponentialCost(20, 1.5));
        a1.level = 1;
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=2^{" + level + "}";
        let getInfo = (level) => "a_2=" + getQ2(level).toString(0);
        a2 = theory.createUpgrade(7, currency, new ExponentialCost(50, Math.log2(10)));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }


    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1);
    theory.createBuyAllUpgrade(1, currency, 1);
    theory.createAutoBuyerUpgrade(2, currency, 1);

    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(0.1, 0.1));

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Unlock the real component R" : "Unlock the imaginary component I";
        dimension.getInfo = () => Localization.getUpgradeAddDimensionDesc();
        dimension.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); theory.invalidateTertiaryEquation(); updateAvailability();}
    }

    {
        aTerm = theory.createMilestoneUpgrade(1, 2);
        aTerm.getDescription = (_) => Localization.getUpgradeAddTermDesc(aTerm.level == 0 ? "\\frac{a_1}{100}" : "\\frac{a_1a_2}{100}");
        aTerm.getInfo = (_) => Localization.getUpgradeAddTermInfo("\\frac{a_1a_2}{100}");
        aTerm.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        q1Exp = theory.createMilestoneUpgrade(2, 3);
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.1");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.1");
        q1Exp.boughtOrRefunded = (_) => { theory.invalidateSecondaryEquation(); }
    }

    {
        q2Exp = theory.createMilestoneUpgrade(3, 2);
        q2Exp.description = Localization.getUpgradeIncCustomExpDesc("q_2", "0.05");
        q2Exp.info = Localization.getUpgradeIncCustomExpInfo("q_q", "0.05");
        q2Exp.boughtOrRefunded = (_) => { theory.invalidateSecondaryEquation(); }
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

    b1.isAvailable = dimension.level > 0;
    b2.isAvailable = dimension.level > 0;
    c1.isAvailable = dimension.level > 1;
    c2.isAvailable = dimension.level > 1;
    aTerm.isAvailable = dimension.level > 1;
    a1.isAvailable = aTerm.level != 0;
    a2.isAvailable = aTerm.level != 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let value_q1 = getQ1(q1.level).pow(getQ1Exponent(q1Exp.level));
    let value_q2 = getQ2(q2.level).pow(getQ2Exponent(q2Exp.level));
    let dq = dt * value_q1 * value_q2;
    q += dq;

    let value_b1 = getQ1(b1.level);
    let value_b2 = getQ2(b2.level);
    let b = BigNumber.from(value_b1 * value_b2);

    let value_c1 = getQ1(c1.level);
    let value_c2 = getQ2(c2.level);
    let c = BigNumber.from(value_c1 * value_c2);

    let value_a1 = getQ1(a1.level);
    let value_a2 = getQ2(a2.level);
    a = BigNumber.from(value_a1 * value_a2);

    let baseCurrencyMultiplier = dt * bonus * (aTerm.level !== 0 ? (a / 100) : 1);
    if(value_q1 === BigNumber.ZERO) {
        currency.value = 0;
    } else {
        t += dt / 10;
        switch (equationLevel) {
            case 0:
                currency.value += baseCurrencyMultiplier * q;
                break;
            case 1:
                currency.value += baseCurrencyMultiplier * sqrt(q ** 2 + R ** 2);
                break;
            case 2:
                currency.value += (baseCurrencyMultiplier * sqrt(q ** 2 + R ** 2 - I ** 2));
                break;
        }
    }
    let value_graph = BigNumber.from(theory.tau.pow(1/0.1) / q);
    I = (b.toNumber() * value_graph.cos()).toNumber();
    R = (c.toNumber() * value_graph.sin()).toNumber();
    state.x = t.toNumber();
    state.y = R;
    state.z = I;

    if(t > 10) {
        t = 0;
        theory.clearGraph();
    }

    theory.invalidateTertiaryEquation();
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
            break;4
    }
    switch(dimension.level) {
        case 0:
            result += "q\\\\";
            result += "e^{iq} = \\cos(q) + i\\sin(q)";
            break;
        case 1:
            result += "\\sqrt{q^2 + R^2}\\\\";
            result += "e^{iq} = b\\cos(q) + i\\sin(q)";
            break;
        case 2:
            result += "\\sqrt{q^2 + R^2 - I^2}\\\\";
            result += "e^{iq} = b\\cos(q) + ci\\sin(q)";
            break;
    }

    result += "\\end{array}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 60;
    let result = "\\begin{array}{c}";
    let q1Ex = "";
    let q2Ex = "";
    if(q1Exp.level != 0) {
        q1Ex = getQ1Exponent(q1Exp.level).toString(1);
    }
    if(q2Exp.level != 0) {
        q2Ex = getQ1Exponent(q2Exp.level).toString(1);
    }
    switch(dimension.level) {
        case 0:
            result += "\\dot{q} = q_1^{" + q1Ex + "}q_2^{" + q2Ex + "}\\\\";
            break;
        case 1:
            result += "\\dot{q} = q_1^{" + q1Ex + "}q_2^{" + q2Ex + "}\\quad\\dot{R} = b_1b_2\\cos(q)\\\\";
            break;
        case 2:
            result += "\\dot{q} = q_1^{" + q1Ex + "}q_2^{" + q2Ex + "}\\quad\\dot{R} = b_1b_2\\cos(q)\\quad\\dot{I} = c_1c_2\\sin(q)\\\\";
            break;
    }
    result += theory.latexSymbol + "=\\max\\rho^{0.1}";
    result += "\\end{array}"
    return result;
}

var getTertiaryEquation = () => {
    let result = "" + "/";

    result += "\\begin{matrix}q=";
    result += q.toString();
    result += ",\\;R =";
    result += BigNumber.from(R).toString(2);
    result += ",\\;I =";
    result += BigNumber.from(I).toString(2);
    result += "\\end{matrix}";

    return result;
}
// -------------------------------------------------------------------------------

var sqrt = (n) => (BigNumber.from(n)).sqrt();
var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(BigNumber.from(0.1));

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getQ1Exponent = (level) => BigNumber.from(1 + 0.1 * level);
var getQ2Exponent = (level) => BigNumber.from(1 + 0.05 * level);

init();