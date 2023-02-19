import './specialty-group.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {SpecialtyGroup} from '@/common/types/specialty';
import {editSpecialtyGroup, getSpecialtyGroup} from '@/admin/actions/data-provider';
import {RouteComponentProps, withRouter} from 'react-router';
import PageTitle from '@/web/views/page-title/page-title';
import composeConnect from '@/common/core/compose/compose';
import {FormikBag, FormikProps, withFormik} from 'formik';
import Label from '@/common/views/label/label';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';

interface SpecialtyGroupInput {
	titles: Record<string, string>;
}

interface SelfProps {}

type RouteProps = RouteComponentProps<{id: string}>;
type Props = SelfProps & RouteProps & FormikProps<SpecialtyGroupInput>;

interface State {
	group?: SpecialtyGroup;
}

const connect = composeConnect<SelfProps, RouteProps, FormikProps<SpecialtyGroupInput>>(
	withRouter,
	withFormik({
		mapPropsToValues: () => ({
			titles: {}
		}),
		handleSubmit: (values, bag: FormikBag<SelfProps & RouteProps, SpecialtyGroupInput>) => {
			const id = bag.props.match.params.id;
			const input = id ? {id, titles: values.titles} : {titles: values.titles};
			editSpecialtyGroup(input)
				.then(() => {
					bag.props.history.push('/panel/specialty/list');
				})
				.finally(() => {
					bag.setSubmitting(false);
				});
		}
	})
);

const b = classname('specialty-group-page');

class SpecialtyGroupPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const props = this.props;
		const id = props.match.params.id;
		getSpecialtyGroup({id}).then((group) => {
			this.setState({group});
			if (group) {
				props.setValues({titles: group.titles || {}});
			}
		});
	}

	render(): React.ReactNode {
		const group = this.state.group;

		const props = this.props;
		return (
			<div className={b()}>
				<PageTitle>{group?.title || ''}</PageTitle>
				<Label text="Русский вариант" />
				<Input
					name="titles.ru"
					value={props.values.titles.ru}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
				/>
				<Label text="Английский вариант" />
				<Input
					name="titles.en"
					value={props.values.titles.en}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
				/>
				<Button text="Сохранить" disabled={props.isSubmitting} onClick={props.submitForm} />
			</div>
		);
	}
}

export default connect(SpecialtyGroupPage);
