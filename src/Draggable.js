// @flow

import React, { Component, PropTypes } from 'react';

type Props = {};

export default class Draggable extends Component {

	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		this.elements = {
			inner: document.getElementsByClassName('marks')[0],
			outer: document.getElementsByClassName('marks-wrapper')[0],
			xAxis: document.getElementsByClassName('x-axis')[0]
		};

		let {innerRightPos, outerRightPos} = this.getPos();

		this.lastDelta = outerRightPos - innerRightPos;

		let newVal = `translateX(${this.lastDelta}px)`;
		this.elements.inner.style.transform = newVal;
		this.elements.xAxis.style.transform = newVal;
	}

	startDrag = (e) => {
		this.pageX = e.pageX;

		let lastTransform = this.elements.inner.style.transform;

		if (!lastTransform) {
			this.lastDelta = 0;
		} else {
			let re = /\D(-?\d+)\D/g;
			let execVal = re.exec(lastTransform);
			this.lastDelta = Number(execVal[1]); 
		}	

		this.checkMove = true;
	}

	processDrag = (e) => {
		let {innerPos, outerPos, innerRightPos, outerRightPos} = this.getPos();

		if (this.lastDelta == 0) {
			this.rightState = outerRightPos - innerRightPos;
		}

		if (!this.checkMove || innerPos > outerPos || innerRightPos < outerRightPos) {
			return;
		}

		let deltaX = e.pageX - this.pageX;
		let newDelta = this.lastDelta + deltaX;

		if (innerRightPos + deltaX < outerRightPos) {
			newDelta = this.rightState;
		}

		if (innerPos + deltaX > outerPos) {
			newDelta = 0; 
		}

		this.lastDelta = newDelta;

		let newVal = `translateX(${newDelta}px)`;
		this.elements.inner.style.transform = newVal;
		this.elements.xAxis.style.transform = newVal;
	}

	drop = (e) => {
		this.checkMove = false;
	}

	renderMarks(marks, marksStyle) {
		const row = Array(this.props.options.height).fill().map((item, i) => ({ value: i }));

		return (
			<div className="marks" 
				 style={marksStyle}
				 onTouchStart={this.startDrag.bind(this)}
				 onTouchMove={this.processDrag.bind(this)} 
				 onTouchEnd={this.drop.bind(this)}
				 onMouseDown={this.startDrag.bind(this)} 
				 onMouseMove={this.processDrag.bind(this)} 
				 onMouseUp={this.drop.bind(this)}>
				{marks.map((mark, markNum) => (
					<div className="ruler-row" key={markNum}>
						{this.props.renderRow(mark, markNum, row)}
					</div>
				))}
			</div>
		);
	}

	renderXAxis(marks, marksStyle) {
		let showDateCount = 0;

		marks.forEach((mark, markNum) => {
			showDateCount = markNum % 10 == 0 ? ++showDateCount : showDateCount;
		});

		let width = parseInt(marks.length * this.props.options.boxSize / showDateCount);

		let style = {
			'width': `${width}px`
		};

		return (
			<div className="x-axis" style={marksStyle}>
				{marks.map((mark, markNum) => (
					markNum % 10 == 0 ? <div className="x-caption" style={style} key={markNum}>
						{mark.date}
					</div> : null
				))}
			</div>
		);
	}

	getPos() {
		const {
			data: marks = [],
			boxSize = 20
		} = this.props.options;

		let chartLength = marks.length;

		let innerPos = this.elements.inner.getBoundingClientRect().left - window.scrollX;
		let outerPos = this.elements.outer.getBoundingClientRect().left - window.scrollX;
		let innerRightPos = innerPos + chartLength * boxSize;
		let outerRightPos = outerPos + this.elements.outer.offsetWidth;

		return {
			innerPos,
			outerPos,
			innerRightPos,
			outerRightPos
		};
	}

	render() {
		const { 
			data: marks,
			boxSize = 20
		} = this.props.options;

		let marksStyle = {
			'width': `${marks.length * boxSize}px`
		};

		return (
			<div className="marks-wrapper">
				{this.renderMarks(marks, marksStyle)}
				{this.renderXAxis(marks, marksStyle)}
			</div>
		);
	}

}