import $ from 'jquery'
import curriculum from 'curriculum'
import React from 'react'
import { createStore } from 'redux'
import { connect, Provider } from 'react-redux'

// TODO: add a space for wrapup comments once people are done

class Header extends React.Component {
    render () {
        let { selectedAnswers, benchmarks } = this.props;
        return (
            <div>
                <a href="/">★ One second code ★</a>
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
        var total = selectedAnswers.size
        selectedAnswers.forEach((value, prog) => {
            if (is_close(value, benchmarks[prog]['exact_iters'])) {
                numCorrect += 1
            }
        })
        return <span className="tracked-tight"> <b>Score:</b> <span className="v-sup">{numCorrect}</span> / <span className="v-sub">{total}</span> </span>;
    }
}

class QuizQuestion extends React.Component {
    render() {
        let { code, name, selectedAnswer, rounded_iters:answer, exact_iters:exactAnswer, onChange } = this.props;
        var answered = selectedAnswer !== undefined
        var correct = is_close(selectedAnswer, exactAnswer)
        var gradeGlyph = correct ? "✓" : "✗"
        return <div className="fl w-100 w-50-l mhm mhl-m mhn-l phm-l">
            <h3>{answered ? gradeGlyph: ""} {name}</h3>
            <AnswerSelector name={name} selectedAnswer={selectedAnswer} exactAnswer={exactAnswer} onChange={onChange} />
            { selectedAnswer !== undefined ?
                <div>
                    <p> <b> You picked: </b>{english(selectedAnswer)} </p>
                    <p> <b> Exact answer: </b>{english(exactAnswer)} </p>
                </div>
            : undefined }
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

        let className = "dib phs pvxs tc ultrabold br2 mrxs mlxs mvxs b--black-20 br2 ba";
        if (checked) {
            className += ""; // TODO
        }
        if (answered && correct) {
            className += " bg-light-green near-white";
        }
        if (checked && !correct) {
            className += " bg-red near-white"
        }

        return (
            <div className={className}>
                <label  htmlFor={id}>
                    {english(value)}
                </label>
                <input type="radio" className="dn" name={name} id={id} value={value}
                    onChange={onChange} checked={checked}
                />
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
    let initialState = new Map()
    allPrograms = [].concat.apply([],curriculum.map(({text, programs}, index) => programs))
    allPrograms.forEach(program => {
        initialState.set(program, undefined)
    })
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
                programs.forEach(program => {
                    if (selectedAnswers.get(program) === undefined) {
                        finished = false
                    }
                })
                return <Section
                    key={index}
                    onAnswerChange={(prog, answer) => dispatch(selectAnswer(prog, answer))}
                    text={text}
                    finished={finished}
                    conclusion={conclusion}
                    programs={
                        programs.map(prog => Object.assign({name: prog, selectedAnswer: selectedAnswers.get(prog)}, benchmarks[prog]))
                    } />
                })
            }
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

$.getJSON("benchmarks.json", function(result) {
    React.render(<Provider store={store}>
                {() => <SmartQuiz curriculum={curriculum} benchmarks={result}/>}
            </Provider>, document.getElementById('quiz'));
});

