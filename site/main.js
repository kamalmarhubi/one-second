import $ from 'jquery'
import curriculum from 'curriculum'
import React from 'react'
import { createStore } from 'redux'
import { connect, Provider } from 'react-redux'

class QuizQuestion extends React.Component {
    render() {
        let { code, name, selectedAnswer, rounded_iters:answer, exact_iters:exactAnswer, onChange } = this.props;
        //  buttons + answer
        //  
        var answered = selectedAnswer !== undefined
        var correct = close(selectedAnswer, exactAnswer)
        var glyphType = correct ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove"
        return <div className='col-md-5'>
            <h3>
                {answered ? <span className={glyphType} aria-hidden="true"></span> : ""}
                {name}
            </h3>
            <AnswerSelector name={name} selectedAnswer={selectedAnswer} exactAnswer={exactAnswer} onChange={onChange} />
            { selectedAnswer !== undefined ?
                <div className='answer'>
                    <p> <b> You picked: </b>{english(selectedAnswer)} </p>
                    <p> <b> Exact answer: </b>{english(exactAnswer)} </p>
                </div>
            : undefined }
            <pre>{code}</pre>
        </div>;
    }
}

function close(selectedAnswer, actualAnswer) {
    var ratio = (selectedAnswer / actualAnswer)
    return (ratio > 0.1 && ratio < 10)
}

class AnswerSelector extends React.Component {
    render() {
        let { name, onChange, selectedAnswer, exactAnswer } = this.props;
        const options = [1, 10, 100, 1000, 10000, 100000,
            1000000, 10000000, 100000000, 100000000, 1000000000];
        return <div className="btn-group" data-toggle="buttons">
        { options.map(val => <AnswerChoice
                key={val}
                checked={val === selectedAnswer}
                correct={close(val, exactAnswer)}
                answered={selectedAnswer !== undefined}
                name={name}
                value={val}
                onChange={() => onChange(val)} />)
        }
        </div>;
    }
}

class AnswerChoice extends React.Component {
    render() {
        let { value, name, onChange, checked, answered, correct } = this.props;
        let id = `${name}-${value}`;
        let btnClass = "btn"
        var selectedStyle = {
          border: "2px solid"
        };

        if (answered) {
            // only do special things to the buttons if there has been an answer
            if (correct) {
                btnClass += " btn-success"
            }
            if (checked) {
                btnClass += " active"
                if (!correct) {
                    btnClass += " btn-danger"
                }
            }
            if (!correct && !checked) {
                btnClass += " disabled"
            }
        }
        return <label className={btnClass} htmlFor={id} style={checked ? selectedStyle : {}}>
            <input type='radio' name={name} id={id} value={value}
                onChange={onChange} checked={checked} />
            {english(value)}</label>;
    }
}

class Section extends React.Component {
    render() {
        let { onAnswerChange, text, programs } = this.props;
        return <div className='row'>
            <div className='col-md-6 col-md-offset-2 jumbotron'>{text}</div>
            {programs.map(prog => <QuizQuestion
                        onChange={answer => onAnswerChange(prog.name, answer)}
                        key={prog.name}
                        {...prog}
                    />)}
        </div>;
    }
}

class Quiz extends React.Component {
    render() {
        let { dispatch, curriculum, benchmarks, selectedAnswers } = this.props;
        return <div>
            { curriculum.map(({text, programs}, index) =>
                <Section
                    key={index}
                    onAnswerChange={(prog, answer) => dispatch(selectAnswer(prog, answer))}
                    text={text}
                    programs={
                        programs.map(prog => Object.assign({name: prog, selectedAnswer: selectedAnswers[prog]}, benchmarks[prog]))
                    } />)
            }
        </div>;
    }
}

let SmartQuiz = connect(state => {return {selectedAnswers: state}})(Quiz);

const SET_ANSWER = Symbol('setAnswer');

function selectAnswer(program, answer) {
    return { type: SET_ANSWER, program, answer };
}

function questions(state={}, action) {
    switch (action.type) {
        case SET_ANSWER: 
            if (state[action.program] !== undefined) {
                return state
            } else {
                return Object.assign({}, state, {[action.program]: action.answer});
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

$.getJSON("/benchmarks.json", function(result) {
    React.render(<Provider store={store}>
                {() => <SmartQuiz curriculum={curriculum} benchmarks={result}/>}
            </Provider>, document.getElementById('quiz'));
});

