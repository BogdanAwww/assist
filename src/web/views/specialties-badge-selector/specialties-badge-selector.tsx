import * as React from 'react';
import SpecialtiesSidebar from '@/web/views/specialties-sidebar/specialties-sidebar';
import BadgeSelector from '@/common/views/badge-selector/badge-selector';
import {getSpecialtyFrequenties} from '@/web/utils/specialty-utils';
import Button from '@/common/views/button/button';
import {SpecialtyGroup} from '@/common/types/specialty';
import {translates} from '@/common/views/translates-provider/translates-provider';

interface Props {
	groups: SpecialtyGroup[];
	values: string[];
	onChange: (specialties: string[]) => void;
}

const LIMIT = 6;

class SpecialtiesBadgeSelector extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const freqs = getSpecialtyFrequenties(this.props.groups);
		return (
			<SpecialtiesSidebar selected={props.values} onChange={props.onChange} limit={LIMIT}>
				{({openSidebar}) => (
					<BadgeSelector
						name="specialties"
						value={props.values}
						items={freqs}
						getValue={(specialty) => specialty._id}
						onChange={(_name, specialties) => props.onChange(specialties)}
						multi
						limit={6}
						additional={
							<Button view="bordered" size="small" text={translates.more} badge onClick={openSidebar} />
						}
					/>
				)}
			</SpecialtiesSidebar>
		);
	}
}

export default SpecialtiesBadgeSelector;
