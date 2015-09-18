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
        return <div className='col-md-5'>
            <h3>{name}</h3>
            <AnswerSelector name={name} selectedAnswer={selectedAnswer} onChange={onChange} />
            <pre>{code}</pre>
            { selectedAnswer !== undefined ?
                <div className='answer'>
                    <b> Answer: </b>{english(answer)}  (exact amount: {english(exactAnswer)})
                </div>
            : undefined }
        </div>;
    }
}

class AnswerSelector extends React.Component {
    render() {
        let { name, onChange, selectedAnswer } = this.props;
        const options = [1, 10, 100, 1000, 10000];
        return <ul>{ options.map(val => <AnswerChoice
                key={val}
                checked={val === selectedAnswer}
                name={name}
                value={val}
                onChange={() => onChange(val)} />)
        }</ul>;
    }
}

class AnswerChoice extends React.Component {
    render() {
        let { value, name, onChange, checked } = this.props;
        let id = `${name}-${value}`;
        return <li>
            <label htmlFor={id}>{value}</label>
            <input type='radio' name={name} id={id} value={value}
                onChange={onChange} checked={checked} />
        </li>;
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
            return Object.assign({}, state, {[action.program]: action.answer});
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

var disp = function(benchmarks, name) {
    var benchmark_results = benchmarks[name]
    var code = benchmark_results["code"]
    var iters = benchmark_results["rounded_iters"]
    var exact_iters = benchmark_results["exact_iters"]
    iters = english(iters)

    var answer = "<div style='display:none' class='answer'> <b> Answer: </b> " + english(iters) +  " (exact amount: " + english(exact_iters) + ") </div>"
    var buttons1 = '<div class="btn-toolbar" role="toolbar"> <div class="btn-group" role="group"> <button type="button" class="btn btn-default">1</button> <button type="button" class="btn btn-default">10</button> <button type="button" class="btn btn-default">100</button> <button type="button" class="btn btn-default">1,000</button> <button type="button" class="btn btn-default">10,000</button> <button type="button" class="btn btn-default">100,000</button><button type="button" class="btn btn-default">1,000,000</button> </div>'
    var buttons2 = '<div class="btn-group" role="group"> <button type="button" class="btn btn-default">10,000,000</button> <button type="button" class="btn btn-default">100,000,000</button> <button type="button" class="btn btn-default">1,000,000,000</button></div></div>'
    var buttons = buttons1 + buttons2
    var code = "<pre>" + code + "</pre>" + "</div>"
    return "<div class = 'col-md-5'>" + "<h3>" + name + "</h3>" + buttons + answer + code
}

var display = function(benchmarks) {
    var i;
    for (i = 0; i < curriculum.length; i++) {
        var programs = curriculum[i]['programs']
        var j;
        $("#code").append("<div class='row'>")

        $("#code").append("<div class='col-md-6 col-md-offset-2 jumbotron'>" + curriculum[i]['text'] + "</div>")
        for (j = 0; j < programs.length; j++) {
            name = programs[j]
            $("#code").append(disp(benchmarks, name))
        }
        $("#code").append("</div>")
    }
}
$.getJSON("/benchmarks.json", function(result) {
    var json = result
    display(result)
    $('button').on('click', function() {
        $(this).parent().parent().find('button').removeClass('active');
        $(this).addClass('active');
        $(this).parent().parent().parent().find('.answer').show();
    })
    React.render(<Provider store={store}>
                {() => <SmartQuiz curriculum={curriculum} benchmarks={result}/>}
            </Provider>, document.getElementById('quiz'));
});

