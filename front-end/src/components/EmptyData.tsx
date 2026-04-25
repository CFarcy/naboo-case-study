import { Flex } from '@mantine/core';
import Image from 'next/image';
import emptyDataSvg from '../../public/images/undraw_no_data_re_kwbl.svg';

export function EmptyData() {
  return (
    <Flex direction="column" align="center" justify="center" w="100%" m="xl">
      <p>Aucune donnée pour le moment</p>
      <Image priority src={emptyDataSvg} alt="No data" height={250} />
    </Flex>
  );
}
