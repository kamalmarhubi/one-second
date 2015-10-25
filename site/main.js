import curriculum from 'curriculum'
import React from 'react'
import { createStore } from 'redux'
import { connect, Provider } from 'react-redux'
import Firebase from 'firebase'
import uuid from 'uuid'
import benchmarks from './benchmarks.json!'

// Persist a user ID for users making multiple attempts
let userId = localStorage.oneSecondUserId;
if (userId == null) {
    userId = uuid.v4();
    localStorage.oneSecondUserId = userId;
}

let attemptId = uuid.v4();

let userRef = new Firebase(
    `https://computers-are-fast.firebaseio.com/users/${userId}`
);

let attemptRef = userRef.child(`attempts/${attemptId}`);

// This will be used in a store subscriber below
let answersRef = attemptRef.child("answers");


// TODO: add a space for wrapup comments once people are done

class Header extends React.Component {
    render () {
        let { selectedAnswers, benchmarks } = this.props;
        return (
            <div>
                <ScoreCard selectedAnswers={selectedAnswers} benchmarks={benchmarks}/> 
            </div>
        );

    }
}

// TODO: make this better: n questions left, x / y correct so far
class ScoreCard extends React.Component {
    render() {
        let { selectedAnswers, benchmarks } = this.props;
        var numCorrect = 0
        var numAnswered = 0
        var numRemaining = 0
        selectedAnswers.forEach((value, prog) => {
            if (is_close(value, benchmarks[prog]['exact_iters'])) {
                numCorrect += 1
            }
            if (value) {
                numAnswered += 1
            } else {
                numRemaining += 1
            }
        })
        return <span className="pos-abs bottom-0 bt left-0 teal bg-white w-100 pvs tc" style={{position: "fixed", zIndex: 999}}>
            <b>Score:</b> <span className="v-sup">{numCorrect}</span> / <span className="v-sub">{numAnswered}</span>
            <span className="w1" style={{display: "inline-block"}}></span>
            <span> <b>Remaining:</b> {numRemaining} </span> 
            <span> <b><a className="pos-abs-l mll mln-l right-2 teal pvs-l" href="/about.html">About this game</a></b></span>
        </span>;
    }
}

class QuizQuestion extends React.Component {
    render() {
        let { code, name, units, selectedAnswer, rounded_iters:answer, exact_iters:exactAnswer, onChange } = this.props;
        var answered = selectedAnswer !== undefined
        var correct = is_close(selectedAnswer, exactAnswer)
        var gradeGlyph = correct ? "✓" : "✗"
        return <div className="fl w-100 w-50-l mhm mhl-m mhn-l phm-l">
            <div className="pos-rel h2">
                <h3 className="pos-abs left-0">{name} </h3>
                <h3 className="pos-abs right-0 mrl">{answered ? gradeGlyph: ""}</h3>
            </div>
            <AnswerSelector name={name} selectedAnswer={selectedAnswer} exactAnswer={exactAnswer} onChange={onChange} />
            <div className="h1">
            { selectedAnswer !== undefined ?
                    <p> <b> Exact answer: </b>{english(exactAnswer)} </p>
            : undefined }
            </div>
            Guess: {units} in one second
            <pre className="f5 ofx-scr bg-near-white pas b--light-silver ba br2">{code}</pre>
        </div>;
    }
}

function is_close(selectedAnswer, actualAnswer) {
    var ratio = (selectedAnswer / actualAnswer)
    return (ratio > 0.1 && ratio < 10)
}

class AnswerSelector extends React.Component {
    render() {
        let { name, onChange, selectedAnswer, exactAnswer } = this.props;
        const options = [1, 10, 100, 1000, 10000, 100000,
            1000000, 10000000, 100000000, 100000000, 1000000000];
        return <ul>
        { options.map(val => <AnswerChoice
                key={val}
                checked={val === selectedAnswer}
                correct={is_close(val, exactAnswer)}
                answered={selectedAnswer !== undefined}
                name={name}
                value={val}
                onChange={() => onChange(val)} />)
        }
        </ul>;
    }
}

class AnswerChoice extends React.Component {
    render() {
        let { value, name, onChange, checked, answered, correct } = this.props;
        let id = `${name}-${value}`;

        // This is really messy and could be cleaned up. Intent is to have a
        // border that is more visible if checked. Achieved by a having an
        // outer div whose border is invisible unless checked. This eliminates
        // janky movement of elements because their size no longer changes.

        let outerClassName = "dib br2 mrxs mlxs mvxs ba bw1";

        // This exists to override the colors set as part of the class.
        let invisibleBorder = { borderColor: "rgba(0,0,0,0)" };
        let outerStyle = checked ? {} : invisibleBorder;

        let innerStyle = checked ? invisibleBorder : {};

        let className = "dib phs pvxs tc ultrabold br2 ba";

        if (checked) {
            outerClassName += " b--black-40";
            className += " near-white b--black-40" ;
        }

        if (!checked || !answered) {
            className += " b--black-20";
        }

        if (checked && !correct) {
            outerClassName += " bg-red";
            className += " bg-red";
        }

        if (checked && correct) {
            outerClassName += " bg-light-green";
        }

        if (answered && correct) {
            className += " near-white bg-light-green";
        }

        return (
            <div onClick={onChange} className={outerClassName} style={outerStyle}>
                <div className={className} style={innerStyle}>
                    <label htmlFor={id}>
                        {english(value)}
                    </label>
                    <input type="radio" className="dn" name={name} id={id} value={value}
                        onChange={onChange} checked={checked}
                    />
                </div>
            </div>
        );
    }
}

class Section extends React.Component {
    render() {
        let { onAnswerChange, text, programs, conclusion, finished } = this.props;
        return <section className="mtxl ptl bdt">
            <div className="bg-light-gray pam br3 mhl mhxxl-l">
            <div className="measure lh-copy f4 f3-l mw-75 center" dangerouslySetInnerHTML={{__html: text}}></div>
            </div>
            <div className="cf">
            {programs.map(prog => <QuizQuestion
                        onChange={answer => onAnswerChange(prog.name, answer)}
                        key={prog.name}
                        {...prog}
                    />)}
            </div>
            { (conclusion && finished) ? 
              <div className="w-75 center f4 f3-l measure lh-copy">
                  <h2 className="f4 f3-l teal">Now that you've guessed</h2><p> 
              {conclusion} </p> </div>
              : ""
            }
        </section>;
    }
}

function getInitialState(curriculum) {
    var initialState = new Map()
    var allPrograms = {}
    curriculum.map(({text, programs}, index) => Object.assign(allPrograms, programs)) 
    for (var key in allPrograms) {
      initialState.set(key, undefined);
    }
    return initialState
}

class Quiz extends React.Component {
    render() {
        let { dispatch, curriculum, benchmarks, selectedAnswers } = this.props;
        return <div className="mw-8">
            <Header
                selectedAnswers={selectedAnswers} 
                benchmarks = {benchmarks}/>

            { curriculum.map(({text, programs, conclusion}, index) => {

                var finished = true
                var programStates = []
                for (var progName in programs) {
                    if (selectedAnswers.get(progName) === undefined) {
                        finished = false
                    }
                    programStates.push(Object.assign({
                        name: progName,
                        units: programs[progName],
                        selectedAnswer: selectedAnswers.get(progName),
                    }, benchmarks[progName]))
                }
                return <Section
                    key={index}
                    onAnswerChange={(prog, answer) => dispatch(selectAnswer(prog, answer))}
                    text={text}
                    finished={finished}
                    conclusion={conclusion}
                    programs={programStates} />
                })
            }
            <div className="h3"> </div>
        </div>;
    }
}

let SmartQuiz = connect(state => {return {selectedAnswers: state}})(Quiz);

const SET_ANSWER = Symbol('setAnswer');

function selectAnswer(program, answer) {
    return { type: SET_ANSWER, program, answer };
}

function questions(state=getInitialState(curriculum), action) {
    switch (action.type) {
        case SET_ANSWER: 
            if (state.get(action.program) !== undefined) {
                return state
            } else {
                var newState = new Map(state)
                newState.set(action.program, action.answer)
                return newState
            }
        default:
            return state;
    }
}

var english = function(iters) {
    var bil = Math.pow(10, 9)
    var mil = Math.pow(10, 6)
    var thousand = 1000
    if (iters >= bil) {
        return Math.round(iters / bil) + ",000,000,000"
    } else if (iters >= mil) {
        return Math.round(iters / mil) + ",000,000"
    } else if (iters >= thousand) {
        return Math.round(iters / thousand) + ",000"
    } else {
        return iters
    }
}

let store = createStore(questions);

let started = false;
let currentValue;
store.subscribe(() => {
    if (!started) {
        started = true;
        // Record time the attempt was started
        attemptRef.child("started").set(Firebase.ServerValue.TIMESTAMP);
    }

    let previousValue = currentValue;
    currentValue = store.getState();

    if (previousValue !== currentValue) {
        for (var [key, val] of currentValue) {
            if (val !== undefined) {
                answersRef.child(key.replace(".", "_")).set(val);
            }
        }
    }
});

React.render(<Provider store={store}>
        {() => <SmartQuiz curriculum={curriculum} benchmarks={benchmarks}/>}
        </Provider>, document.getElementById('quiz'));
