import * as React from 'react';
import classname from '@/common/core/classname';
import {Specialty, SpecialtyGroup} from '@/common/types/specialty';
import {editSpecialty, getSpecialty, getSpecialtyGroups} from '@/admin/actions/data-provider';
import {RouteComponentProps, withRouter} from 'react-router';
import PageTitle from '@/web/views/page-title/page-title';
import composeConnect from '@/common/core/compose/compose';
import {FormikBag, FormikProps, withFormik} from 'formik';
import Label from '@/common/views/label/label';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import Checkbox from '@/common/views/checkbox/checkbox';
import Select from '@/common/views/select/select';

interface SpecialtyInput {
	group?: string;
	titles: Record<string, string>;
	isFrequentlyUsed: boolean;
}

interface SelfProps {}

type RouteProps = RouteComponentProps<{id: string}>;
type Props = SelfProps & RouteProps & FormikProps<SpecialtyInput>;

interface State {
	specialty?: Specialty;
	groups?: SpecialtyGroup[];
}

const connect = composeConnect<SelfProps, RouteProps, FormikProps<SpecialtyInput>>(
	withRouter,
	withFormik({
		mapPropsToValues: () => ({
			group: undefined,
			titles: {},
			isFrequentlyUsed: false
		}),
		handleSubmit: ({group, titles, isFrequentlyUsed}, bag: FormikBag<SelfProps & RouteProps, SpecialtyInput>) => {
			const id = bag.props.match.params.id;
			const input = {id, titles, isFrequentlyUsed, group};
			editSpecialty(input)
				.then(() => {
					bag.props.history.push('/panel/specialty/list');
				})
				.finally(() => {
					bag.setSubmitting(false);
				});
		}
	})
);

const b = classname('specialty-edit-page');

class SpecialtyEditPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const props = this.props;
		const id = props.match.params.id;
		const proms = [getSpecialtyGroups(), id ? getSpecialty({id}) : Promise.resolve(undefined)] as const;
		Promise.all(proms).then(([groups, specialty]) => {
			this.setState({groups, specialty});
			const group = groups.find((group) => group.specialties?.find((spec) => spec._id === specialty?._id));
			props.setValues({
				group: group?._id,
				titles: specialty?.titles || {},
				isFrequentlyUsed: Boolean(specialty?.isFrequentlyUsed)
			});
		});
	}

	render(): React.ReactNode {
		const props = this.props;
		const state = this.state;
		const specialty = state.specialty;
		const id = props.match.params.id;
		return (
			<div className={b()}>
				<PageTitle>{id ? specialty?.title : 'Новая специальность'}</PageTitle>

				<Label text="Группа" />
				<Select
					name="group"
					value={props.values.group}
					options={state.groups || []}
					getOptionLabel={(option) => option.title}
					getOptionValue={(option) => option._id}
					onChange={(option) => props.setFieldValue('group', option._id)}
				/>
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
				<Checkbox
					name="isFrequentlyUsed"
					value={props.values.isFrequentlyUsed}
					setFieldValue={props.setFieldValue}
				>
					Часто используется
				</Checkbox>
				<Button text="Сохранить" disabled={props.isSubmitting} onClick={props.submitForm} />
			</div>
		);
	}
}

export default connect(SpecialtyEditPage);
